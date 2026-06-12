const { db_Select, db_Insert } = require('../../model/MasterModule');
const Joi = require('joi'),
path = require('path'),
fs = require('fs/promises'),
bcrypt = require('bcrypt'),
dateFormat = require('dateformat');

const tempCollFilePath = path.join(__dirname, '../../', process.env.TEMP_RECEIVED_COLLECTION_FOLDER_PATH),
orgCollFilePath = path.join(__dirname, '../../', process.env.RECEIVED_COLLECTION_FOLDER_PATH);

const endcollectionCheckUser = async (req, res,next) => {
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
        try{
            let fields = `coll_flag='N', received_date='${dateFormat(new Date(), "yyyy-mm-dd")}', end_flag='Y'`,
                wherre = `bank_id=${bank_id} AND branch_code='${branch_code}' AND agent_code='${agent_code}' AND coll_flag='Y' AND end_flag='N' AND agent_trans_no ='${agent_trans_no}'`;
            let res_dt = await db_Insert("md_agent_trans", fields, null, wherre, 1);
            resolve({
                "success": res_dt,
                "status": true
            });
        }catch(err){
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

        // --- Step 5: Move File & Finish ---
        await fs.rename(tempFilePath, finalFilePath);

        return res.send({ status: true, success: 'Process completed and file stored successfully.' });

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

module.exports = { receiveCollection, endcollectionCheckUser }