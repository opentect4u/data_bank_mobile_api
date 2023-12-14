const Joi = require("joi");
const dateFormat = require('dateformat');
const { db_Insert } = require("../../model/MasterModule");


// const bccsdate

const bccs_api=async(req,res)=>{
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            amount: Joi.number().precision(2).max(999999999999999.99).required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ "error": errors,"status": false });
        }
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")

        let fields=`max_amt=${value.amount}, created_at='${datetime}'`,
        where=`bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}'`;
        let res_dt = await db_Insert("md_agent", fields, null, where, 1);

        res.json({
            "data": res_dt,
            "status": true
        });

    } catch (error) {
        res.json({
            "data": error,
            "status": false
        });
    }
}
module.exports={bccs_api}