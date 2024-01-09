const dateFormat = require('dateformat');
const { db_Select } = require('../../model/MasterModule');
const joi = require('joi');

const report_list = async(req,res)=>{
    try {
        var bank = await db_Select('*', "md_bank", null, null);
        const viewData = {
            title: "Summary Report",
            page_path: "/report/summary_report_superAdmin/view_report",
            bank: bank
        };
        res.render('common/layouts/main', viewData)
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    } 

}

const get_branch_name=async (req,res)=>{
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
	
        var sql=`select a.branch_id,a.branch_code,a.branch_name,a.contact_person,a.phone_no from md_branch a
                 where a.bank_id = ${value.bank_id}`

        var branchData= await db_db_Select_Sqery(sql);
        res.json({
            "SUCCESS": {branchData},
            "status": true
        });
}

const agent_report = async (req, res) => {
    try {
        var data = req.body
        console.log(data);
        let select = 'agent_id, agent_code, agent_name, phone_no',
            table_name = 'md_agent',
            whr = `bank_id = ${data.bank_id} AND branch_code = ${data.branch_id} AND agent_code = ${data.agent_code}`;
        var resdata = await db_Select(select, table_name, whr, null)
        console.log(resdata);
        res.json(resdata)
        
    } catch (error) {
        res.json({
            "suc": 0,
            "msg": []
        });
    }
}



// const summary_report = async(req,res)=>{      
//     const datetime = dateFormat(new Date(), "yyyy-mm-dd")
//     const user_data = req.session.user.user_data.msg[0];
//     var whrDAta = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'  AND active_flag='Y'AND user_type='O'`,
//         selectData = "user_id";
//     let dbuser_data = await db_Select(selectData, "md_user", whrDAta, null);
//     var viewData = {
//         title: "Day Scroll Report",
//         page_path: "/report/summary_report_superAdmin/view_report",
//         data: dbuser_data.msg,
//         nowdate:datetime
//     };
//     res.render('common/layouts/main', viewData)
// }

module.exports = {report_list, get_branch_name, agent_report}