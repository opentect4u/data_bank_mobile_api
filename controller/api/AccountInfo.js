const Joi = require('joi');
const { db_Select } = require('../../model/MasterModule');

//search account
const search_account = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_number: Joi.string().min(3).required(),
            flag: Joi.string().max(1).required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors,status:false });
        }
        const table_name="td_account_dtls"
        var whrDAta = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND acc_type = '${value.flag}' AND (customer_name LIKE '%${value.account_number}%' OR account_number LIKE '%${value.account_number}%')`,
        selectData = "*";
        const order = null
        let res_data = await db_Select(selectData, table_name, whrDAta, order);
       
        delete res_data.sql;
        if(res_data.msg.length>0){
            res.json({
                "success": res_data,
                "status": true
            });
        }else{
            res.json({
                "Error": "Search Account Not Found",
                // "res_data":res_data,
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

//account info
const account_info = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_number: Joi.number().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors,status:false });
        }
        const table_name="td_account_dtls"
        var whrDAta = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number = '${value.account_number}'`,
        selectData = "*";
        const order = null
        let res_data = await db_Select(selectData, table_name, whrDAta, order);
       
        delete res_data.sql;
        if(res_data.msg.length>0){
            res.json({
                "success": res_data,
                "status": true
            });
        }else{
            res.json({
                "Error": "Account Not Found",
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

module.exports = { search_account,account_info }