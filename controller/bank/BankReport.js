const { db_Select } = require("../../model/MasterModule");
const dateFormat = require('dateformat');
const Joi = require("joi");
const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")

const day_scroll_report=async(req,res)=>{
    try {
        const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `bank_id='${user_data.bank_id}'  AND active_flag='Y'`,
        selectData = "branch_code,branch_name,branch_id ";
    let dbuser_data = await db_Select(selectData, "md_branch", whrDAta, null);
    // console.log(dbuser_data)
    const datetimee = dateFormat(new Date(), "yyyy-mm-dd")
    var viewData = {
        title: "Day Scroll Report",
        page_path: "/bank_report/day_scroll_report/input",
        data: dbuser_data.msg,
        nowdate:datetimee
    };
    res.render('common/layouts/main', viewData)
    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
    
}
const day_scroll_report_post = async(req,res)=>{
    // try {
        const schema = Joi.object({
            // agent_code: Joi.string().required(),
            branch_code: Joi.string().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const user_data = req.session.user.user_data.msg[0];
        let select = "transaction_date as date,account_type,account_number, account_holder_name,deposit_amount,agent_code",
            where = `bank_id=${user_data.bank_id} ${value.branch_code != 0 ? `AND branch_code='${value.branch_code}' ` : ''}AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;

            // where = `bank_id=${user_data.bank_id} AND branch_code='${value.branch_code}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;
            // where = `bank_id=${user_data.bank_id} AND branch_code='${user_data.branch_code}' AND agent_code='${value.agent_code}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;

        let order=`ORDER BY transaction_date ASC`;
        let resData = await db_Select(select, "td_collection", where, order);
        delete resData.sql
        const datetime = dateFormat(new Date(), "dd/mm/yyyy hh:MM:ss")
        var viewData = {
            title: "Day Scroll Report",
            page_path: "/bank_report/day_scroll_report/report",
            data: resData.msg,
            fdate:dateFormat(value.from_date, "dd/mm/yyyy"),
            datetime:datetime,
            tdate:dateFormat(value.to_date, "dd/mm/yyyy")
        };
        res.render('common/layouts/main', viewData)

    // } catch (error) {
    //     res.json({
    //         "success": error,
    //         "status": false
    //     });
    // }
}

module.exports={day_scroll_report,day_scroll_report_post}