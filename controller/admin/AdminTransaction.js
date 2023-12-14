const dateFormat = require('dateformat');
const { db_Check, db_Select } = require('../../model/MasterModule');
const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
const check_and_collection=async(req,res)=>{
    try {
        const agent_code = req.body.agent_code;
        const user_data = req.session.user.user_data.msg[0];
        var select_q = "send_date";
        var whr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}' AND coll_flag='Y' AND end_flag='N' AND agent_trans_no IS NULL AND received_date IS NULL ORDER BY send_date DESC `;
        let res_dt = await db_Check(select_q, "md_agent_trans", whr);
        if(res_dt.msg>0&&res_dt.msg==1){
            res.json(res_dt.msg);
        }else{
            res.json(res_dt.msg);
        }
    } catch (error) {
        res.json(error);
    }
}

const settings=async(req,res)=>{
    try {
        const user_data = req.session.user.user_data.msg[0];
        let select = 'a.id, a.user_id,a.active_flag,a.device_id,a.device_sl_no,b.agent_name,b.agent_address,b.phone_no,b.email_id,b.max_amt',
            table_name = 'md_user as a, md_agent as b',
            whr = `a.user_id=b.agent_code AND a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}' AND b.bank_id='${user_data.bank_id}' AND b.branch_code='${user_data.branch_code}' AND a.user_type='O'`;
        const resData = await db_Select(select, table_name, whr, null)
        delete resData.sql

        var viewData={
            title:"Settings",
            page_path:"/settings/settings",
            data:resData
        };
        res.render('common/layouts/main',viewData)
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        }); 
    }
}
module.exports={check_and_collection,settings}
