const Joi = require("joi");
const { db_Select } = require("../../model/MasterModule");
const dateFormat = require('dateformat');
const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")




const agent_info = async (req, res) => {
    try {


        const schema = Joi.object({
            agent_code: Joi.string().required(),
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
        let table = 'md_user as a,md_agent as b,md_branch as c',
            select = "b.agent_name,a.user_id,c.branch_name,b.phone_no,b.account_no,b.max_amt",
            where = `a.branch_code=c.branch_code AND b.agent_code=a.user_id AND a.bank_id=${user_data.bank_id} AND a.branch_code='${user_data.branch_code}' AND a.user_id='${value.agent_code}' AND a.user_type='O' AND a.active_flag='Y' AND c.bank_id =${user_data.bank_id} AND b.bank_id=${user_data.bank_id} AND b.branch_code='${user_data.branch_code}'`;
        let resData = await db_Select(select, table, where, null);

        delete resData.sql
        res.json({
            "SUCCESS": resData,
            "status": true
        });

    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
}



const fetchtransNumber = async (req, res) => {
    try {
        const schema = Joi.object({
            // agent_code: Joi.string().required(),
            fDate: Joi.string().required(),
            tDate: Joi.string().required(),
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
        console.log("user_data", user_data)
        let table = 'md_agent_trans a, md_agent b',
            select = "a.agent_trans_no,a.agent_code,b.agent_name,a.received_date",
            where = `a.agent_code=b.agent_code AND a.bank_id = b.bank_id AND a.bank_id =${user_data.bank_id} AND a.branch_code='${user_data.branch_code}' AND b.bank_id =${user_data.bank_id} AND b.branch_code='${user_data.branch_code}' AND a.agent_trans_no IS NOT NULL AND a.coll_flag='N' AND a.end_flag='Y' AND a.received_date BETWEEN '${value.fDate}' AND '${value.tDate}'`,
            order=null;
            //order=`GROUP BY a.agent_trans_no, a.received_date, a.agent_code`;
        let resData = await db_Select(select, table, where, order);
        if(resData.suc > 0){
            for(let dt of resData.msg){
                let table = 'td_collection a',
                    select = "SUM(a.deposit_amount) as amount, COUNT(a.deposit_amount) as count_account, a.download_flag",
                    where = `a.agent_trans_no = '${dt.agent_trans_no}'`,
                    order=`GROUP BY a.download_flag`;
                let colDt = await db_Select(select, table, where, order);
                dt['amount'] = colDt.suc > 0 ? (colDt.msg.length > 0 ? colDt.msg[0].amount : 0) : 0
                dt['count_account'] = colDt.suc > 0 ? (colDt.msg.length > 0 ? colDt.msg[0].count_account : 0) : 0
                dt['download_flag'] = colDt.suc > 0 ? (colDt.msg.length > 0 ? colDt.msg[0].download_flag : 0) : 0
            }
        }

        console.log("====================",resData)

        // delete resData.sql
        res.json({
            "SUCCESS": resData,
            "status": true
        });

    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
    
}

const fetch_account=async (req,res)=>{
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required()
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
        let select='account_number', 
        where=`bank_id = ${user_data.bank_id} AND branch_code = '${user_data.branch_code}' AND agent_code = '${value.agent_code}' `,
         order=`GROUP BY account_number`;
        let resData = await db_Select(select, "td_collection", where, order);
        delete resData.sql
        res.json({
            "SUCCESS": resData,
            "status": true
        });

    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
}
module.exports = { agent_info,fetchtransNumber,fetch_account }