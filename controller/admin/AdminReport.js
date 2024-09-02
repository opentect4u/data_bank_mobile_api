const Joi = require("joi");
const { db_Select, db_Insert } = require("../../model/MasterModule");
const dateFormat = require('dateformat');
const datetime = dateFormat(new Date(), "yyyy-mm-dd")


const day_scroll_report = async(req,res)=>{      
    const datetime = dateFormat(new Date(), "yyyy-mm-dd")
    const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'  AND active_flag='Y'AND user_type='O'`,
        selectData = "user_id";
    let dbuser_data = await db_Select(selectData, "md_user", whrDAta, null);
    var viewData = {
        title: "Day Scroll Report",
        page_path: "/report/day_scroll_report/input",
        data: dbuser_data.msg,
        nowdate:datetime
    };
    res.render('common/layouts/main', viewData)
}
const day_scroll_report_post = async(req,res)=>{
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required(),
            // account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
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
        let select = "transaction_date as date,account_type,account_number, account_holder_name,deposit_amount, product_code",
            where = `bank_id=${user_data.bank_id} AND branch_code='${user_data.branch_code}' AND agent_code='${value.agent_code}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;
            let order=`ORDER BY transaction_date ASC`;
        let resData = await db_Select(select, "td_collection", where, order);

        let resData2 = await db_Select('*', "md_agent", `bank_id=${user_data.bank_id} AND branch_code='${user_data.branch_code}' AND agent_code='${value.agent_code}'`, null);

        // console.log("resData============",resData2);
        delete resData.sql
        var viewData = {
            title: "Day Scroll Report",
            page_path: "/report/day_scroll_report/report",
            data: resData.msg,
            fdate:value.from_date,
            tdate:value.to_date,
            datetime : dateFormat(new Date(), "dd-mm-yyyy hh:MM:ss"),
            agent_info:resData2.msg[0]
        };
        res.render('common/layouts/main', viewData)


    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
}





const individual_day_scroll_report = async(req,res)=>{
    const datetime = dateFormat(new Date(), "yyyy-mm-dd")
    const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'  AND active_flag='Y'AND user_type='O'`,
        selectData = "user_id";
    let dbuser_data = await db_Select(selectData, "md_user", whrDAta, null);
    var viewData = {
        title: "Day Scroll Report",
        page_path: "/report/individual_day_scroll_report/input",
        data: dbuser_data.msg,
        nowdate:datetime
    };
    res.render('common/layouts/main', viewData)
}
const individual_day_scroll_report_post = async(req,res)=>{
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required(),
            account: Joi.string().required(),
            // account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
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
        let select = "transaction_date as date,account_type,account_number, account_holder_name,deposit_amount",
            where = `bank_id=${user_data.bank_id} AND branch_code='${user_data.branch_code}' AND agent_code='${value.agent_code}'AND account_number='${value.account}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;
            let order=`ORDER BY transaction_date ASC`;
        let resData = await db_Select(select, "td_collection", where, order);
        delete resData.sql
        var viewData = {
            title: "Day Scroll Report",
            page_path: "/report/individual_day_scroll_report/report",
            data: resData.msg,
            fdate:value.from_date,
            tdate:value.to_date
        };
        res.render('common/layouts/main', viewData)
    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
}

const acc_type_list = (agent_code, bank_id, br_code) => {
    return new Promise(async (resolve, reject) => {
        var select = 'DISTINCT product_code, acc_type',
        table_name = 'td_account_dtls',
        whr = `agent_code = '${agent_code}' AND bank_id = ${bank_id} AND branch_code = ${br_code}`,
        order = null;
        var res_dt = await db_Select(select, table_name, whr, order)
        resolve(res_dt)
    })
}

const acc_type_list_ajax = async (req, res) => {
    const user_data = req.session.user.user_data.msg[0];
    var data = req.body
    var acc_type_list = await acc_type_list(data.agent_code, user_data.bank_id, user_data.branch_code)
    res.send(acc_type_list)
}

const account_type_wise_report = async(req,res)=>{
    try {
    const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'  AND active_flag='Y'AND user_type='O'`,
        selectData = "user_id";
    let dbuser_data = await db_Select(selectData, "md_user", whrDAta, null);
    const datetimee = dateFormat(new Date(), "yyyy-mm-dd")
    var viewData = {
        title: "Account Type Wise Report",
        page_path: "/report/account_type_wise_report/input",
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

const account_type_wise_report_post = async(req,res)=>{
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
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


        let select = "transaction_date as date,account_number,account_holder_name,deposit_amount",
            where = `bank_id=${user_data.bank_id} AND branch_code='${user_data.branch_code}' AND agent_code='${value.agent_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;
            let order=`ORDER BY transaction_date ASC`;
        let resData = await db_Select(select, "td_collection", where, order);

        delete resData.sql


        var viewData = {
            title: "Account Type Wise Report",
            page_path: "/report/account_type_wise_report/report",
            data: resData.msg,
            fdate:value.from_date,
            tdate:value.to_date,
            datetime :dateFormat(new Date(), "dd-mm-yyyy hh:MM:ss")
        };
        res.render('common/layouts/main', viewData)




        


    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
}



const summary_report = async(req,res)=>{      
    const datetime = dateFormat(new Date(), "yyyy-mm-dd")
    const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'  AND active_flag='Y'AND user_type='O'`,
        selectData = "user_id";
    let dbuser_data = await db_Select(selectData, "md_user", whrDAta, null);
    var viewData = {
        title: "Day Scroll Report",
        page_path: "/report/summary_report/input",
        data: dbuser_data.msg,
        nowdate:datetime
    };
    res.render('common/layouts/main', viewData)
}


const summary_report_post = async(req,res)=>{
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required(),
            // account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
            // from_date: Joi.string().required(),
            // to_date: Joi.string().required(),
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
        let select = "a.agent_trans_no,a.agent_code,a.send_date,a.received_date,a.end_flag, sum(b.deposit_amount)deposit_amount",
            where = `a.agent_trans_no = b.agent_trans_no and a.agent_code = b.agent_code AND a.bank_id=${user_data.bank_id} AND a.branch_code='${user_data.branch_code}' AND a.agent_code='${value.agent_code}' `;
            //AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'
            let order=`group by a.agent_trans_no,a.agent_code,a.send_date,a.received_date,a.end_flag
            order by a.send_date`;

        let resData = await db_Select(select, "md_agent_trans a,td_collection b", where, order);

        let resData2 = await db_Select('*', "md_agent", `bank_id=${user_data.bank_id} AND branch_code='${user_data.branch_code}' AND agent_code='${value.agent_code}'`, null);

        // console.log("resData============",resData2);
        delete resData.sql
        var viewData = {
            title: "Day Scroll Report",
            page_path: "/report/summary_report/report",
            data: resData.msg,
            // fdate:value.from_date,
            // tdate:value.to_date,
            datetime : dateFormat(new Date(), "dd-mm-yyyy hh:MM:ss"),
            agent_info:resData2.msg[0]
        };

        // console.log("Starting Date",viewData);
        res.render('common/layouts/main', viewData)


    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
}



module.exports={day_scroll_report,day_scroll_report_post,account_type_wise_report,account_type_wise_report_post,individual_day_scroll_report,individual_day_scroll_report_post,summary_report,summary_report_post, acc_type_list, acc_type_list_ajax}