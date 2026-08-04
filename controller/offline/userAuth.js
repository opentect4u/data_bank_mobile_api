const Joi = require("joi");
const { db_Select, db_Insert } = require("../../model/MasterModule");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// In-memory challenge store (agent_code -> { challenge, expiresAt })
const challengeStore = new Map();

// Device / Agent Registration with Hardware Public Key
const register = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.required(),
            agent_code: Joi.string().required(),
            device_id: Joi.string().required(),
            public_key: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors, status: false });
        }

        // Check if agent exists in md_user
        const whr = `user_id='${value.agent_code}' AND bank_id='${value.bank_id}' AND active_flag='Y' AND user_type='O'`;
        const checkUser = await db_Select('*', 'md_user', whr, null);
        delete checkUser.sql;

        if (!checkUser || checkUser.suc === 0 || checkUser.msg.length === 0) {
            return res.json({
                Error: "Agent not found or inactive for the given Bank ID",
                status: false
            });
        }

        const dbUser = checkUser.msg[0];
        // Once an agent has registered a public_key, re-registration is strictly forbidden
        if (dbUser.public_key && dbUser.public_key.trim() !== "") {
            return res.json({
                Error: "This agent is already registered. Re-registration is not allowed.",
                status: false
            });
        }

        // Sanitize & escape public key string for SQL storage
        const sanitizedPublicKey = value.public_key.replace(/'/g, "''");
        const setFields = `public_key='${sanitizedPublicKey}', device_id='${value.device_id}'`;
        const updateWhr = `user_id='${value.agent_code}' AND bank_id='${value.bank_id}'`;

        const updateRes = await db_Insert('md_user', setFields, null, updateWhr, 1);

        if (updateRes.suc > 0) {
            return res.json({
                message: "Device and Public Key registered successfully",
                status: true
            });
        } else {
            return res.json({
                Error: "Failed to save public key in database",
                status: false
            });
        }
    } catch (err) {
        return res.json({
            error: err.message || err,
            status: false,
            position: "User Register Mysql"
        });
    }
};

// Generate random cryptographic challenge for authentication
const challenge = async (req, res) => {
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors, status: false });
        }

        // Generate 32-byte random hex string
        const challengeStr = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute TTL

        challengeStore.set(value.agent_code, {
            challenge: challengeStr,
            expiresAt: expiresAt
        });

        return res.json({
            status: true,
            challenge: challengeStr
        });
    } catch (err) {
        return res.json({
            error: err.message || err,
            status: false,
            position: "Challenge Generation"
        });
    }
};

const my_agent = async (req, res) => {
    try {
        const schema = Joi.object({
            device_id: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        var whrDAta = `device_id='${value.device_id}' AND active_flag='Y'AND user_type='O'`,
            selectData = "user_id";
        let res_data = await db_Select(selectData, "md_user", whrDAta, null);
        // console.log("===length===",res_data.msg.length)
        delete res_data.sql;
        if (res_data.msg.length > 0) {
            res.json({
                "success": res_data,
                "status": true
            });
        } else {
            res.json({
                "Error": "Please Asign Devices",
                "status": false
            });
        }
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}

//login Operator with Cryptographic Signature Verification or Password Fallback
const login = async (req, res) => {
    try {
        var bank_acc_type = [];
        const schema = Joi.object({
            agent_code: Joi.string().optional(),
            user_id: Joi.string().optional(),
            device_id: Joi.string().optional(),
            password: Joi.string().optional(),
            signature: Joi.string().optional(),
        }).or('agent_code', 'user_id');

        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors, status: false });
        }

        const agentCode = value.agent_code || value.user_id;
        let effectiveDeviceId = value.device_id;
        let isAuthenticated = false;

        // Signature-based authentication (Hardware Cryptographic Device Binding)
        if (value.signature) {
            const cached = challengeStore.get(agentCode);
            if (!cached || cached.expiresAt < Date.now()) {
                return res.json({
                    Error: "Challenge expired or invalid. Please request a new challenge.",
                    status: false
                });
            }

            // Fetch public_key and legacy device_id from md_user
            const userWhr = `user_id='${agentCode}' AND active_flag='Y' AND user_type='O'`;
            const userRes = await db_Select('public_key, device_id, password', 'md_user', userWhr, null);
            delete userRes.sql;

            if (!userRes || userRes.suc === 0 || userRes.msg.length === 0) {
                return res.json({
                    Error: "Agent not found or inactive",
                    status: false
                });
            }

            const dbUser = userRes.msg[0];
            if (!dbUser.public_key) {
                return res.json({
                    Error: "Device not registered for cryptographic authentication. Please register first.",
                    status: false
                });
            }

            // Verify signature using Node.js crypto
            try {
                let publicKeyPem = dbUser.public_key;
                if (!publicKeyPem.includes('-----BEGIN PUBLIC KEY-----')) {
                    publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
                }

                const verifier = crypto.createVerify('SHA256');
                verifier.update(cached.challenge);
                verifier.end();

                // Try verifying as base64 first, fallback to hex if needed
                let isVerified = false;
                try {
                    isVerified = verifier.verify(publicKeyPem, value.signature, 'base64');
                } catch (e) {
                    const verifierHex = crypto.createVerify('SHA256');
                    verifierHex.update(cached.challenge);
                    verifierHex.end();
                    isVerified = verifierHex.verify(publicKeyPem, value.signature, 'hex');
                }

                if (!isVerified) {
                    return res.json({
                        Error: "Invalid cryptographic signature",
                        status: false
                    });
                }

                // Signature valid! Invalidate challenge to prevent replay attacks
                challengeStore.delete(agentCode);
                effectiveDeviceId = dbUser.device_id;
                isAuthenticated = true;
            } catch (cryptoErr) {
                return res.json({
                    Error: "Signature verification failed: " + (cryptoErr.message || cryptoErr),
                    status: false
                });
            }
        } else if (value.password && value.device_id) {
            // Legacy Password-based authentication
            var whr = `device_id='${value.device_id}' AND user_id='${agentCode}' AND active_flag='Y' AND user_type='O'`;
            let res_dt = await db_Select('password', "md_user", whr, null);
            delete res_dt.sql;
            if (res_dt.suc > 0 && res_dt.msg.length > 0) {
                let db_pass = res_dt.msg[0].password;
                if (await bcrypt.compare(value.password, db_pass)) {
                    isAuthenticated = true;
                    effectiveDeviceId = value.device_id;
                }
            }
        }

        if (isAuthenticated) {
            var table_name = "md_user a,md_bank b,md_branch c,md_agent d",
                whrDAta = `a.bank_id=b.bank_id AND a.branch_code=c.branch_code AND b.bank_id=c.bank_id AND d.agent_code=a.user_id AND d.bank_id=a.bank_id AND d.branch_code=a.branch_code AND a.device_id='${effectiveDeviceId}' AND a.user_id='${agentCode}' AND a.active_flag='Y' AND user_type='O'`,
                selectData = "d.allow_collection_days,a.id, a.bank_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic , b.bank_name,c.branch_name, d.agent_name,d.email_id,d.phone_no,IF(b.sec_amt_type != 'M', d.max_amt, d.allow_collection_days * d.max_amt) max_amt,b.sec_amt_type,d.print_opt,b.active_flag bank_active_flag, d.active_flag agent_active_flag, b.bank_address, b.device_type";

            let user_data = await db_Select(selectData, table_name, whrDAta, null);

            if(user_data.suc > 0 && user_data.msg.length > 0){
                var select = 'bank_id, dds_flag, rd_flag, loan_flag',
                table_name = 'md_bank_acc_type',
                whr = `bank_id = '${user_data.msg[0].bank_id}'`,
                order = null;
                bank_acc_type = await db_Select(select, table_name, whr, order)
            }else{
                bank_acc_type = []
            }

            delete user_data.sql;

            
            let userallData=user_data.msg[0];
            var selectCollectionData = " ifnull(SUM(deposit_amount),0) AS total_collection"
            
            whrCollectionDAta = `bank_id=${userallData.bank_id} AND branch_code=${userallData.branch_code} AND agent_code='${agentCode}' AND agent_trans_no is null
            AND  download_flag = 'N'`;

            let total_collection = await db_Select(selectCollectionData, "td_collection", whrCollectionDAta, null);
            
            delete total_collection.sql;
            let whrSeetingData = `device_id='${effectiveDeviceId}'`;
            let setting = await db_Select("*", "td_settings", whrSeetingData, null);
            delete setting.sql;

            let trans = await db_Select(`sl_no, sync_agent_trans_no agent_trans_no, agent_code, coll_flag, DATE_FORMAT(send_date, '%Y-%m-%d') trans_dt`, 'md_agent_trans', `bank_id=${userallData.bank_id} AND branch_code=${userallData.branch_code} AND agent_code='${agentCode}' AND coll_flag = 'Y'`, 'ORDER BY send_date DESC LIMIT 1')
            delete trans.sql
            
            let logo_dt = await db_Select("file_path", "td_logo", `bank_id='${userallData.bank_id}'`, null);
            delete logo_dt.sql

            res.json({
                "success": { user_data, total_collection, setting, bank_acc_type: bank_acc_type.suc > 0 ? bank_acc_type.msg : [], trans, logo_path: logo_dt.suc > 0 && logo_dt.msg.length > 0 ? logo_dt.msg[0].file_path : '' },
                "status": true
            });
        } else {
            res.json({
                "Error": "Authentication Failed. Incorrect Credentials or Signature.",
                "status": false
            });
        }
    } catch (err) {
        res.json({
            "error": err.message || err,
            "status": false,
            "position": "User Auth Mysql"
        });
    }
}

const getAgentPrintType = async (req, res) => {
    try{
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.optional(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var whr = `a.agent_code = b.user_id and a.bank_id=b.bank_id and a.branch_code=b.branch_code and b.device_id='${value.device_id}' AND a.active_flag='Y' AND b.user_type='O'`;
        let res_dt = await db_Select('a.agent_code, a.printer_type', "md_agent a, md_user b", whr, null);
        delete res_dt.sql;
        if (res_dt.suc > 0 && res_dt.msg.length > 0) {
            res.json({
                "success": res_dt,
                "status": true
            });
        } else {
            res.json({
                "Error": "Please Asign Devices",
                "status": false
            });
        }
    }catch(error){
        res.json({
            "error": error,
            "status": false
        });
    }
}

module.exports = { my_agent, login, getAgentPrintType, register, challenge };