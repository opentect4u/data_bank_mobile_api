const express=require("express");
const { dashboard } = require("../controller/admin/Dashboard");
const { agent_list, agent, editAgentdata, edit_save_agent_data } = require("../controller/superAdmin/Agent.controller");
const { AuthCheckedMW } = require("../middleware/AuthCheckedMW");
const { fetch_bank_info, get_branch_name } = require("../controller/superAdmin/FetchData.controller");
const { bank_list, add_bank_list, edit_bank_list, edit_bank_list_save, admin_bank_list } = require("../controller/superAdmin/Bank.controller");
const { branch_list, add_branch_admin, editBranch_admin, edit_branch_list, updatedata_branch } = require("../controller/superAdmin/Admin_branch.controller");
const { add_branch } = require("../controller/bank/branch.controller");

const Sadmin = express.Router()


Sadmin.get('/',dashboard)
Sadmin.get('/agent',AuthCheckedMW,agent_list)
Sadmin.post('/fetch_bank_info',AuthCheckedMW,fetch_bank_info)

Sadmin.post('/agent_data',agent)
Sadmin.get('/edit_agent',editAgentdata)
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

// Sadmin.get('/admin_branch')

module.exports={Sadmin}