const Joi = require("joi");
const { db_Select_Sqery, db_Select } = require("../../model/MasterModule");

const fetch_bank_info=async (req,res)=>{
    // try {
        const schema = Joi.object({
            bank_id: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
	
        var sql=`select branch_name,sum(active) as active ,sum(inactive) as inactive from (SELECT 	a.branch_name,count(b.user_id)active,0 inactive from    md_branch a,md_user b where   a.bank_id = b.bank_id and     a.branch_code = b.branch_code and     a.bank_id = ${value.bank_id} and     b.user_type = 'O' and     b.active_flag = 'Y' group by a.branch_name UNION SELECT 	a.branch_name,0 active,count(b.user_id)inactive from    md_branch a,md_user b where   a.bank_id = b.bank_id and     a.branch_code = b.branch_code and     a.bank_id = ${value.bank_id} and     b.user_type = 'O' and     b.active_flag = 'N' group by a.branch_name) a group by branch_name`

        var branchData=await db_Select_Sqery(sql);
            var whr=`bank_id=${value.bank_id}`
        var md_subscription = await db_Select('no_of_users', "md_subscription", whr, null);
        delete branchData.sql
	
        res.json({
            "SUCCESS": {branchData,md_subscription},
            "status": true
        });

        
    // } catch (error) {
    //     res.json({
    //         "ERROR": error,
    //         "status": false
    //     });
    // }
}
module.exports={fetch_bank_info}