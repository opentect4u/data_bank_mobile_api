const Joi = require("joi");
const { db_Select } = require("../../model/MasterModule");
const bcrypt = require('bcrypt');

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

//login Operator
const login = async (req, res) => {
    try {
        var bank_acc_type = []
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
                selectData = "d.allow_collection_days,a.id, a.bank_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic , b.bank_name,c.branch_name, d.agent_name,d.email_id,d.phone_no,IF(b.sec_amt_type != 'M', d.max_amt, d.allow_collection_days * d.max_amt) max_amt,b.sec_amt_type,d.print_opt";

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
            
            whrCollectionDAta = `bank_id=${userallData.bank_id} AND branch_code=${userallData.branch_code} AND agent_code='${value.user_id}' AND agent_trans_no is null
            AND  download_flag = 'N'`;

            let total_collection = await db_Select(selectCollectionData, "td_collection", whrCollectionDAta, null);
            delete total_collection.sql;
            let whrSeetingData = `device_id='${value.device_id}'`;
            let setting = await db_Select("*", "td_settings", whrSeetingData, null);
            delete setting.sql;

            let trans = await db_Select(`sl_no, agent_trans_no, agent_code, coll_flag, DATE_FORMAT(send_date, '%Y-%m-%d') trans_dt`, 'md_agent_trans', `bank_id=${userallData.bank_id} AND branch_code=${userallData.branch_code} AND agent_code='${value.user_id}' AND coll_flag = 'Y'`, 'ORDER BY send_date DESC LIMIT 1')
            // console.log(trans, '-------------------');
            delete trans.sql
            
            let logo_dt = await db_Select("file_path", "td_logo", `bank_id='${userallData.bank_id}'`, null);
            delete logo_dt.sql

            res.json({
                "success": { user_data, total_collection, setting, bank_acc_type: bank_acc_type.suc > 0 ? bank_acc_type.msg : [], trans, logo_path: logo_dt.suc > 0 && logo_dt.msg.length > 0 ? logo_dt.msg[0].file_path : '' },
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

module.exports = { my_agent, login, getAgentPrintType };