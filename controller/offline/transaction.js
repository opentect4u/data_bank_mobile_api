const { db_Select, db_Insert } = require('../../model/MasterModule');
const Joi = require('joi'),
    path = require('path'),
    fs = require('fs/promises'),
    bcrypt = require('bcrypt'),
    dateFormat = require('dateformat'),
    fsSync = require('fs');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// ─── S3 Client Configuration ───────────────────────────────────────────────
const cleanEnvVar = (val) => {
    if (!val) return val;
    return val.trim().replace(/^['"]|['"]$/g, '');
};

const s3Client = new S3Client({
    region: cleanEnvVar(process.env.AWS_REGION_NAME),
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: cleanEnvVar(process.env.AWS_ACCESS_KEY_ID),
        secretAccessKey: cleanEnvVar(process.env.AWS_SECRET_ACCESS_KEY),
        sessionToken: cleanEnvVar(process.env.AWS_SESSION_TOKEN),
    } : undefined,
});

const s3BucketName = cleanEnvVar(process.env.AWS_S3_BUCKET_NAME);

/**
 * Uploads a local file to S3 under receivedCollectionFiles/<filename>
 * Returns { success: true } or { success: false, error: message }
 */
const uploadFileToS3 = async (localFilePath, s3Key) => {
    try {
        const fileBuffer = fsSync.readFileSync(localFilePath);
        await s3Client.send(new PutObjectCommand({
            Bucket: s3BucketName,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: 'application/json',
        }));
        console.log(`File uploaded to S3: s3://${s3BucketName}/${s3Key}`);
        return { success: true };
    } catch (err) {
        console.error(`Failed to upload file to S3 (${s3Key}):`, err.message);
        return { success: false, error: err.message };
    }
};

const tempCollFilePath = path.join(__dirname, '../../', process.env.TEMP_RECEIVED_COLLECTION_FOLDER_PATH),
    orgCollFilePath = path.join(__dirname, '../../', process.env.RECEIVED_COLLECTION_FOLDER_PATH);

const endcollectionCheckUser = async (req, res, next) => {
    try {
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.required(),
            password: Joi.string().required(),
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            coll_flag: Joi.string().valid('Y', 'N').required(),
            agent_trans_no: Joi.string().required(),
            date_time: Joi.string().required(),
            collection_dtls: Joi.array().required(),
            total_collection_count: Joi.number().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var whr = `device_id='${value.device_id}'AND user_id='${value.user_id}' AND active_flag='Y'AND user_type='O'`;
        let res_dt = await db_Select('password', "md_user", whr, null);
        delete res_dt.sql;
        let db_pass = res_dt.msg[0].password

        if (await bcrypt.compare(value.password, db_pass)) {
            next();
        } else {
            res.json({
                "error": "Incorrect Password",
                "status": false
            });
        }
    } catch (error) {
        res.json({
            "error": "User Not Found",
            "status": false
        });
    }
}

const updateDatabaseTable = (agent_code, bank_id, branch_code, agent_trans_no) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fields = `coll_flag='N', received_date='${dateFormat(new Date(), "yyyy-mm-dd")}', end_flag='Y'`,
                wherre = `bank_id=${bank_id} AND branch_code='${branch_code}' AND agent_code='${agent_code}' AND coll_flag='Y' AND end_flag='N' AND agent_trans_no ='${agent_trans_no}'`;
            let res_dt = await db_Insert("md_agent_trans", fields, null, wherre, 1);
            resolve({
                "success": res_dt,
                "status": true
            });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    })
}

const receiveCollection = async (req, res) => {
    // Extract necessary variables from the payload
    const { agent_trans_no, total_collection_count, collection_dtls, agent_code, bank_id, branch_code } = req.body;

    // --- OPTIMIZATION: Step 3 (In-Memory Validation) ---
    // Validate the count BEFORE doing any slow disk operations
    if (!Array.isArray(collection_dtls)) {
        return res.send({
            "error": 'collection_dt is missing or not an array.',
            "status": false
        });
    }

    if (collection_dtls.length !== total_collection_count) {
        return res.send({
            "error": `Count mismatch: Array length is ${collection_dt.length}, but total_collection_count is ${total_collection_count}.`,
            "status": false
        });
    }

    // --- Step 2: Setup File Paths ---
    // Create a safe, unique filename using the trans_no and current datetime
    const datetime = new Date().getTime();
    const filename = `${agent_trans_no}_${datetime}.json`;

    const tempFilePath = path.join(tempCollFilePath, filename);
    const finalFilePath = path.join(orgCollFilePath, filename);

    try {
        // Ensure directories exist
        await fs.mkdir(tempCollFilePath, { recursive: true });
        await fs.mkdir(orgCollFilePath, { recursive: true });

        // Write to temporary directory
        const fileContent = JSON.stringify(req.body, null, 2);
        await fs.writeFile(tempFilePath, fileContent, 'utf8');

        // --- Step 4: Update Database ---
        // If this fails, it will throw an error and jump to the catch block
        await updateDatabaseTable(agent_code, bank_id, branch_code, agent_trans_no);

        // --- Step 5: Move File to Local Final Directory ---
        await fs.rename(tempFilePath, finalFilePath);

        // --- Step 6: Upload File to S3 receivedCollectionFiles/ ---
        const s3Key = `receivedCollectionFiles/${filename}`;
        const s3Result = await uploadFileToS3(finalFilePath, s3Key);

        if (!s3Result.success) {
            // S3 upload failed — log the error but do NOT block the response.
            // The file is already safely stored locally; Lambda will not trigger.
            console.error(`S3 upload failed for ${filename}: ${s3Result.error}`);
            return res.send({
                status: true,
                success: 'File stored locally. S3 upload failed — Lambda sync will not trigger.',
                s3_error: s3Result.error
            });
        }

        return res.send({ status: true, success: 'Process completed, file stored and uploaded to S3 successfully.', received_coll_count: total_collection_count, processed_coll_count: collection_dtls.length });

    } catch (error) {
        // --- CRITICAL: Cleanup Phase ---
        // If the database update fails, we don't want to leave orphaned files in the temp folder.
        try {
            // Attempt to delete the temp file if it was created
            await fs.unlink(tempFilePath);
            console.log(`Cleaned up temp file: ${tempFilePath}`);
        } catch (cleanupError) {
            console.log(cleanupError);
            console.log(`Failed to clean up temp file: ${tempFilePath}. Manual cleanup may be required.`);
        }

        console.error('Process failed:', error.message);
        return res.send({ status: false, success: error.message });
    }
}

const checkOfflineSyncStatus = async (req, res, next) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            agent_trans_no: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let chkTransNo = await db_Select('sl_no, coll_flag, end_flag', 'md_agent_trans', `agent_trans_no='${value.agent_trans_no}' AND bank_id='${value.bank_id}' AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}'`);

        if (chkTransNo.suc > 0) {
            if (chkTransNo.msg.length > 0) {
                if (chkTransNo.msg[0].coll_flag === 'N' && chkTransNo.msg[0].end_flag === 'Y') {
                    let chkColl = await db_Select('COUNT(DISTINCT receipt_no) tot_coll', 'td_collection', `agent_trans_no='${value.agent_trans_no}' AND bank_id='${value.bank_id}' AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}'`);

                    if (chkColl.suc > 0 && chkColl.msg.length > 0) {
                        res_dt = {
                            "success": {
                                "sync_count": chkColl.msg[0].tot_coll
                            },
                            "status": true
                        };
                        return res.send(res_dt);
                    } else {
                        res_dt = {
                            status: false,
                            error: "Error while fetching the collection data."
                        }
                        return res.send(res_dt);
                    }
                } else {
                    res_dt = {
                        status: false,
                        error: "Collection is not ended for this transaction."
                    }
                    return res.send(res_dt);
                }
            } else {
                res_dt = {
                    status: false,
                    error: "No data found in md_agent_trans for this transaction."
                }
                return res.send(res_dt);
            }
        } else {
            res_dt = {
                status: false,
                error: "Error while fetching the data from md_agent_trans."
            }
            return res.send(res_dt);
        }
    } catch (error) {
        res.json({
            "error": "Some error occurred while checking the offline sync status.",
            "status": false
        });
    }
}

module.exports = { receiveCollection, endcollectionCheckUser, checkOfflineSyncStatus }