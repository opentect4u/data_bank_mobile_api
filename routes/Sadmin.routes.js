const express=require("express");
const { dashboard } = require("../controller/admin/Dashboard");
const { agent_list, agent, editAgentdata, edit_save_agent_data, add_agent } = require("../controller/superAdmin/Agent.controller");
const { AuthCheckedMW } = require("../middleware/AuthCheckedMW");
const { fetch_bank_info, get_branch_name } = require("../controller/superAdmin/FetchData.controller");
const { bank_list, add_bank_list, edit_bank_list, edit_bank_list_save, admin_bank_list } = require("../controller/superAdmin/Bank.controller");
const { branch_list, add_branch_admin, editBranch_admin, edit_branch_list, updatedata_branch } = require("../controller/superAdmin/Admin_branch.controller");
const { add_branch } = require("../controller/bank/branch.controller");
const { summary_report, report_list, agent_report, summary_report_post_admin, col_report_list, collection_report } = require("../controller/superAdmin/Report.controller");

const Sadmin = express.Router()


Sadmin.get('/',dashboard)
Sadmin.get('/agent',AuthCheckedMW,agent_list)
Sadmin.post('/fetch_bank_info',AuthCheckedMW,fetch_bank_info)

Sadmin.post('/agent_data',agent)
Sadmin.get('/edit_agent',editAgentdata)
Sadmin.post('/add_agent',add_agent)
Sadmin.post('/update_agent_data',edit_save_agent_data)

Sadmin.get('/branch_admin',AuthCheckedMW, branch_list)
Sadmin.post('/get_branch_name',AuthCheckedMW,get_branch_name)
Sadmin.post('/add_branch',AuthCheckedMW,add_branch_admin)
Sadmin.get('/edit_branch',edit_branch_list)
Sadmin.post('/edit_branch_save',updatedata_branch)

Sadmin.get('/bank',AuthCheckedMW,bank_list)
Sadmin.post('/add_bank',AuthCheckedMW,add_bank_list)
Sadmin.get('/edit_bank', edit_bank_list)
Sadmin.post('/edit_bank_save', edit_bank_list_save)

Sadmin.get('/report',report_list)
Sadmin.post('/report_branch_name',get_branch_name)
Sadmin.post('/agent_data_report',agent_report)
Sadmin.post('/summary_report_post_admin',summary_report_post_admin)


Sadmin.get('/collection_report',col_report_list)
Sadmin.post('/collection_report_update',collection_report)

// Sadmin.get('/admin_branch')

module.exports={Sadmin}