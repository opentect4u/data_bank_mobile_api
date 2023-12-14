const Joi = require('joi');
const bcrypt = require('bcrypt');
const { db_Select } = require("../model/MasterModule");

const endcollectionMW = async (req, res,next) => {
    try {
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.required(),
            password: Joi.string().required(),

            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            coll_flag: Joi.string().valid('Y', 'N').required()
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
            var table_name = "md_user a,md_bank b,md_branch c",

                whrDAta = `a.bank_id=b.bank_id AND a.branch_code=c.branch_code AND a.device_id='${value.device_id}'AND a.user_id='${value.user_id}' AND a.active_flag='Y'AND user_type='O'`,

                selectData = "a.id, a.bank_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic , b.bank_name,c.branch_name";

            let user_data = await db_Select(selectData, table_name, whrDAta, null);

            delete user_data.sql;
            var selectCollectionData = "ifnull(SUM(deposit_amount),0) total_collection"
            whrCollectionDAta = `agent_code='${value.user_id}' AND agent_trans_no IS NULL
            AND  download_flag = 'N'`;
            
            let total_collection = await db_Select(selectCollectionData, "td_collection", whrCollectionDAta, null);
            delete total_collection.sql;

            next();
            
        } else {
            res.json({
                "Error": "Incorrect Password",
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

module.exports = { endcollectionMW }