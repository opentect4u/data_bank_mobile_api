const Joi = require('joi');
const bcrypt = require('bcrypt');

const { db_Insert, db_Select } = require('../../model/MasterModule');

//create account
const register = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.required(),
            branch_code: Joi.required(),
            user_type: Joi.required(),
            device_sl_no: Joi.required(),
            device_id: Joi.required(),
            user_id: Joi.required(),
            password: Joi.string().required(),
            pin_no: Joi.required(),
            active_flag: Joi.required(),
            created_by: Joi.required(),
            created_at: Joi.required(),
            delete_flag: Joi.required(),
            profile_pic: Joi.required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        let pss = value.password
        let enc_pss = bcrypt.hashSync(pss, 10)

        let fields = '(bank_id, branch_code, user_type,password, device_sl_no, device_id, user_id, pin_no, active_flag, created_by, created_at, delete_flag, profile_pic)',

            values = `('${value.bank_id}','${value.branch_code}','${value.user_type}','${enc_pss}','${value.device_sl_no}','${value.device_id}','${value.user_id}','${value.pin_no}','${value.active_flag}','${value.created_by}','${value.created_at}','${value.delete_flag}','${value.profile_pic}')`;
        let res_dt = await db_Insert("md_user", fields, values, null, 0);
        res.json({
            "success": res_dt,
            "status": true
        });
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}
//login Operator
const login = async (req, res) => {
    try {
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.required(),
            password: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var whr = `device_id='${value.device_id}'AND user_id='${value.user_id}' AND active_flag='Y' AND user_type='O'`;
        let res_dt = await db_Select('password', "md_user", whr, null);
        delete res_dt.sql;
        let db_pass = res_dt.msg[0].password
        if (await bcrypt.compare(value.password, db_pass)) {
            var table_name = "md_user a,md_bank b,md_branch c,md_agent d",
                whrDAta = `a.bank_id=b.bank_id AND a.branch_code=c.branch_code AND b.bank_id=c.bank_id AND d.agent_code=a.user_id AND d.bank_id=a.bank_id AND d.branch_code=a.branch_code AND a.device_id='${value.device_id}'AND a.user_id='${value.user_id}' AND a.active_flag='Y'AND user_type='O'`,
                selectData = "d.allow_collection_days,a.id, a.bank_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic , b.bank_name,c.branch_name, d.agent_name,d.email_id,d.phone_no,d.max_amt,b.sec_amt_type";

            let user_data = await db_Select(selectData, table_name, whrDAta, null);

            delete user_data.sql;

            
            let userallData=user_data.msg[0];
            var selectCollectionData = " ifnull(SUM(deposit_amount),0) AS total_collection"
            /* The line `whrCollectionDAta = `bank_id=${userallData.bank_id}AND
            branch_code=${userallData.} AND agent_code='${value.user_id}' AND agent_trans_no is
            null` is creating a SQL WHERE clause for selecting data from the `td_collection` table. */
            whrCollectionDAta = `bank_id=${userallData.bank_id} AND branch_code=${userallData.branch_code} AND agent_code='${value.user_id}' AND agent_trans_no is null
            AND  download_flag = 'N'`;

            let total_collection = await db_Select(selectCollectionData, "td_collection", whrCollectionDAta, null);
            delete total_collection.sql;
            let whrSeetingData = `device_id='${value.device_id}'`;
            let setting = await db_Select("*", "td_settings", whrSeetingData, null);
            delete setting.sql;
            res.json({
                "success": { user_data, total_collection, setting },
                "status": true
            });
        } else {
            res.json({
                "Error": "Incorrect Password",
                "status": false
            });
        }
    } catch (err) {
        res.json({
            "error": err,
            "status": false,
            "position": "User Auth Mysql"
        });
    }
}
//get agent
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


const change_pin = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.required(),
            branch_code: Joi.required(),
            device_id: Joi.required(),
            user_id: Joi.required(),
            old_password: Joi.string().length(4).required(),
            password: Joi.string().length(4).required(),
            confirm_password: Joi.string().length(4).required().valid(Joi.ref('password'))
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }


        var whr = `bank_id='${value.bank_id}' AND branch_code='${value.branch_code}' AND device_id='${value.device_id}' AND user_id='${value.user_id}' AND active_flag='Y'AND user_type='O'`;
        let res_dt = await db_Select('password', "md_user", whr, null);
        delete res_dt.sql;
        let db_pass = res_dt.msg[0].password

        if (await bcrypt.compare(value.old_password, db_pass)) {
            let pss = value.password
            let enc_pss = bcrypt.hashSync(pss, 10)
            var set = `password='${enc_pss}'`;
            var whr2 = `bank_id='${value.bank_id}' AND branch_code='${value.branch_code}' AND device_id='${value.device_id}' AND user_id='${value.user_id}' AND active_flag='Y'AND user_type='O'`;
            let res_dt = await db_Insert("md_user", set, null, whr2, 1);


            res.json({
                "success": "password change successfully",
                "status": true
            });
        } else {
            res.json({
                "error": "Miss Match Password",
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


const app_version = async (req, res) => {
    try {
        const schema = Joi.object({
            app_version:Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }



        let res_dt = await db_Select('*', "md_app_version", null, null);
        console.log("===res_dt===",res_dt.msg[0].app_version)


        let update_status=(res_dt.msg[0].app_version==value.app_version) ?'N':'Y';

        res.json({
            "data": res_dt.msg[0],
            "status": true,
            "update_status":update_status
        });
        

    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}

module.exports = { register, login, my_agent, change_pin,app_version }