const Joi = require('joi');
const bcrypt = require('bcrypt');
const { db_Insert, db_Select } = require('../../model/MasterModule');
const dateFormat = require('dateformat');

const dashboard = async (req, res) => {
    const user_data = req.session.user.user_data.msg[0];
    console.log(user_data);
    
    const BrProgData = await db_Select('*', 'bank_branch_coll_progress', `bank_id=${user_data.bank_id} ${user_data.user_type == 'R' ? `AND branch_code = '${user_data.branch_code}'` : ''}`, null)

    const agntDayWiseCol = await db_Select(`a.bank_id, b.bank_name, a.branch_code, c.branch_name, a.agent_code, d.agent_name, a.transaction_date, DATE_FORMAT(a.transaction_date, '%d-%b-%y') trn_dt, sum(a.deposit_amount) tot_col_amt`, 'td_collection a, md_bank b, md_branch c, md_agent d', `a.bank_id=b.bank_id AND a.branch_code=c.branch_code AND a.bank_id=c.bank_id AND a.agent_code=d.agent_code AND a.bank_id=d.bank_id AND a.branch_code=d.branch_code AND MONTH(a.transaction_date) = MONTH(NOW()) AND a.bank_id=${user_data.bank_id} ${user_data.user_type == 'R' ? `AND a.branch_code = '${user_data.branch_code}'` : ''}`, `group by a.bank_id, b.bank_name, a.branch_code, c.branch_name, a.agent_code, d.agent_name, a.transaction_date order by a.bank_id,a.branch_code,a.transaction_date,a.agent_code`)

    var viewData={
        title:"Dashboard",
        page_path:"/dashboard/dashboard",
        data:"",
        br_pro_data: BrProgData.suc > 0 ? BrProgData.msg : [],
        agnt_dt_wise_col: agntDayWiseCol.suc > 0 ? agntDayWiseCol.msg : []
    };
    res.render('common/layouts/main',viewData)
}


module.exports = { dashboard }