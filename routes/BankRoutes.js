const express=require("express");
const { agent, edit_save_agent, editAgent, delete_agent, check_user_collection } = require("../controller/bank/Agent.controller");
const { day_scroll_report, day_scroll_report_post } = require("../controller/bank/BankReport");
const { branch_list, add_branch, editBranch, updatedata_branch } = require("../controller/bank/branch.controller");
const { AuthCheckedMW } = require("../middleware/AuthCheckedMW");
const BankRoutes = express.Router()


BankRoutes.get('/agent',AuthCheckedMW,agent)
BankRoutes.get('/agent/:branch_id?',AuthCheckedMW,agent)
BankRoutes.get('/edit_agent/:agent_id',AuthCheckedMW,editAgent)
BankRoutes.post('/update_agent/:agent_id',AuthCheckedMW,edit_save_agent)
BankRoutes.get('/delete_agent',AuthCheckedMW,delete_agent)
BankRoutes.get('/check_user_collection',AuthCheckedMW,check_user_collection)


BankRoutes.get('/branch',AuthCheckedMW,branch_list)
BankRoutes.post('/add_branch',AuthCheckedMW,add_branch)
BankRoutes.get('/edit_branch/:branchid',AuthCheckedMW,editBranch)
BankRoutes.post('/updatedata_branch',AuthCheckedMW,updatedata_branch)

BankRoutes.get('/day_scroll_report',AuthCheckedMW,day_scroll_report)
BankRoutes.post('/day_scroll_report_post',AuthCheckedMW,day_scroll_report_post)

module.exports={BankRoutes};