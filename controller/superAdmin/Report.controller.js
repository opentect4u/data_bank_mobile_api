const dateFormat = require('dateformat');
const { db_Select } = require('../../model/MasterModule');
const joi = require('joi');
const Joi = require('joi');

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
        // console.log(data);
        let select = 'agent_id, agent_code, agent_name, phone_no',
            table_name = 'md_agent',
            whr = `bank_id = ${data.bank_id} AND branch_code = ${data.branch_id}`;
        var agenData = await db_Select(select, table_name, whr, null)
        // console.log(agenData);
        res.json(agenData)
        
    } catch (error) {
        res.json({
            "suc": 0,
            "msg": []
        });
    }
}


const summary_report_post_admin = async(req,res)=>{
    try {
        var data = req.body
        const user_data = req.session.user.user_data.msg[0];
        var full_query = `
        select a.agent_trans_no,a.agent_code,a.send_date,a.received_date,a.end_flag, sum(b.deposit_amount)deposit_amount
        from   md_agent_trans a,td_collection b
        where  a.agent_trans_no = b.agent_trans_no 
        and    a.agent_code = b.agent_code 
        AND    a.bank_id= '${data.bank_id}'
        AND    a.branch_code= '${data.branch_id}'
        AND    a.agent_code= '${data.agent_code}'
        and    a.end_flag  = 'Y'
        UNION
        select a.agent_trans_no,a.agent_code,a.send_date,a.received_date,a.end_flag, sum(b.deposit_amount)deposit_amount
        from   md_agent_trans a,td_collection b
        where    a.agent_code = b.agent_code 
        AND    a.bank_id= '${data.bank_id}'
        AND    a.branch_code= '${data.branch_id}'
        AND    a.agent_code= '${data.agent_code}'
        and    a.end_flag = 'N'
        and    b.agent_trans_no is null
        `;
        let select = "",
            where = null;

        let resData = await db_Select(select, null, where, null, full_query, true);
        console.log(resData);

        let resData2 = await db_Select('*', "md_agent", `bank_id=${data.bank_id} AND branch_code='${data.branch_id}' AND agent_code='${data.agent_code}'`, null);
        console.log(resData2);

        console.log("resData============",resData2);
        delete resData.sql
        var viewData = {
            title: "Day Scroll Report",
            // page_path: "/report/summary_report_superAdmin/view_report",
            data: resData.msg,
            datetime : dateFormat(new Date(), "dd-mm-yyyy hh:MM:ss"),
            agent_info:resData2.msg[0]
        };

        console.log("Starting Date",viewData);
        res.send(resData)


    } catch (error) {
        console.log(error);
        res.json({
            "success": error,
            "status": false
        });
    }
}

const col_report_list = async(req,res)=>{
    try {
        const viewData = {
            title: "Collection Report",
            page_path: "/report/summary_report_superAdmin/collection_report",
            
        };
        res.render('common/layouts/main', viewData)
    } catch (error) {
        console.log(error);
        res.json({
            "ERROR": error,
            "status": false
        });
    } 
}

const collection_report = async(req,res)=>{
    try {
        const schema = Joi.object({
            agent_trans: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        console.log(value);
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const user_data = req.session.user.user_data.msg[0];
        // console.log(user_data,'user');
        var select = "receipt_no,transaction_date,account_number,account_holder_name,deposit_amount,balance_amount,download_flag, bank_id, branch_code, agent_code",
        where = `agent_trans_no ='${value.agent_trans}' `;
        let resData = await db_Select(select, "td_collection", where);


        var select = "a.bank_id, b.bank_name, a.branch_code, c.branch_name, a.agent_code, d.agent_name, a.send_date, a.received_date, a.end_flag, a.agent_trans_no",
        where = `a.bank_id=b.bank_id AND a.branch_code=c.branch_code AND a.agent_code=d.agent_code AND a.agent_trans_no = '${value.agent_trans}'`;
        let resDat2 = await db_Select(select, "md_agent_trans a, md_bank b, md_branch c, md_agent d", where);

        console.log("resData============",resDat2);
        delete resData.sql
        
        var viewData = {
            data: resData.msg,
            agent_info:resDat2.msg[0]
        };

        console.log("Starting Date",viewData);
        res.send(viewData)


    } catch (error) {
        console.log(error);
        res.json({
            "success": error,
            "status": false
        });
    }
}

const col_progress = async(req,res)=>{
    try {
        const viewData = {
            title: "Collection In Progress",
            page_path: "/report/summary_report_superAdmin/collection_progress",
            
        };
        res.render('common/layouts/main', viewData)
    } catch (error) {
        console.log(error);
        res.json({
            "ERROR": error,
            "status": false
        });
    } 
}

const collection_progress = async(req,res)=>{
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        console.log(value);
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const user_data = req.session.user.user_data.msg[0];
        // console.log(user_data,'user');
        var select = "receipt_no,transaction_date,account_number,account_holder_name,deposit_amount,balance_amount,download_flag, bank_id, branch_code",
        where = `agent_code ='${value.agent_code}' AND download_flag='N'`;
        let resData = await db_Select(select, "td_collection", where);


        var select = "a.bank_id, b.bank_name, a.branch_code, c.branch_name, d.agent_name, a.send_date, a.received_date, a.end_flag, a.agent_trans_no",
        where = `a.bank_id=b.bank_id AND a.branch_code=c.branch_code AND a.agent_code=d.agent_code AND a.agent_code = '${value.agent_code}' AND a.end_flag = 'N'`;
        let resDat2 = await db_Select(select, "md_agent_trans a, md_bank b, md_branch c, md_agent d", where);

        console.log("resData============",resDat2);
        delete resData.sql
        
        var viewData = {
            data: resData.msg,
            agent_info:resDat2.msg[0]
        };

        console.log("Starting Date",viewData);
        res.send(viewData)


    } catch (error) {
        console.log(error);
        res.json({
            "success": error,
            "status": false
        });
    }
}

module.exports = {report_list, get_branch_name, agent_report, summary_report_post_admin, col_report_list, collection_report,col_progress, collection_progress}