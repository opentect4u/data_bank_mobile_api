const express=require("express");
const fileUpload = require('express-fileupload')
const { dashboard } = require("../controller/admin/Dashboard");
const { agent_list, agent, editAgentdata, edit_save_agent_data, add_agent, active_user, total_user, sms, bank_name_sms, sms_url, add_sms, app_url, app_dtls, header_bank_list, add_header_footer, show_header_footer, edit_header_footer, edit_save_header_footer, reset_data, reset_bank_data, reset_branch_name } = require("../controller/superAdmin/Agent.controller");
const { AuthCheckedMW } = require("../middleware/AuthCheckedMW");
const { fetch_bank_info, get_branch_name, bank_name, password } = require("../controller/superAdmin/FetchData.controller");
const { bank_list, add_bank_list, edit_bank_list, edit_bank_list_save, admin_bank_list, inactive_bank_list, edit_inactive_bank_list, edit_inactive_bank_list_save, bank_list_logo, upload_bank_logo, get_logo, get_logo_dtls, edit_bank_list_logo } = require("../controller/superAdmin/Bank.controller");
const { branch_list, add_branch_admin, editBranch_admin, edit_branch_list, updatedata_branch } = require("../controller/superAdmin/Admin_branch.controller");
const { add_branch } = require("../controller/bank/branch.controller");
const { summary_report, report_list, agent_report, summary_report_post_admin, col_report_list, collection_report, col_progress, collection_progress } = require("../controller/superAdmin/Report.controller");
const { reset } = require("nodemon");

const Sadmin = express.Router()

// Middleware for file uploads
Sadmin.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 1 MB limit
  }));

Sadmin.get('/',dashboard)
Sadmin.get('/agent',AuthCheckedMW,agent_list)
Sadmin.post('/fetch_bank_info',AuthCheckedMW,fetch_bank_info)

Sadmin.post('/password',AuthCheckedMW,password)

Sadmin.get('/summary',AuthCheckedMW,bank_name)
Sadmin.post('/total_user',AuthCheckedMW,total_user)

Sadmin.get('/sms',AuthCheckedMW,bank_name_sms)
Sadmin.post('/sms_url',AuthCheckedMW,sms_url)
Sadmin.post('/add_sms',AuthCheckedMW,add_sms)

Sadmin.get('/about',AuthCheckedMW,app_url)

Sadmin.get('/reset',AuthCheckedMW,reset_bank_data)
Sadmin.post('/reset_branch',AuthCheckedMW,reset_branch_name)

Sadmin.get('/logo',AuthCheckedMW,bank_list_logo)
Sadmin.post('/logo_upload',AuthCheckedMW,upload_bank_logo)
Sadmin.post('/get_logo',AuthCheckedMW,get_logo_dtls)

Sadmin.get('/header_footer',AuthCheckedMW,header_bank_list)
Sadmin.post('/add_header_footer',AuthCheckedMW,add_header_footer)
Sadmin.get('/show_header_footer',AuthCheckedMW,show_header_footer)
Sadmin.get('/edit_header_footer',AuthCheckedMW,edit_header_footer)
Sadmin.post('/edit_save_header_footer',AuthCheckedMW,edit_save_header_footer)


Sadmin.post('/agent_data',AuthCheckedMW,agent)
Sadmin.get('/edit_agent',AuthCheckedMW,editAgentdata)
Sadmin.post('/add_agent',AuthCheckedMW,add_agent)
Sadmin.post('/update_agent_data',AuthCheckedMW,edit_save_agent_data)

Sadmin.get('/branch_admin',AuthCheckedMW, branch_list)
Sadmin.post('/get_branch_name',AuthCheckedMW,get_branch_name)
Sadmin.post('/add_branch',AuthCheckedMW,add_branch_admin)
Sadmin.get('/edit_branch',AuthCheckedMW,edit_branch_list)
Sadmin.post('/edit_branch_save',AuthCheckedMW,updatedata_branch)

Sadmin.get('/bank',AuthCheckedMW,bank_list)
Sadmin.post('/add_bank',AuthCheckedMW,add_bank_list)
Sadmin.get('/edit_bank',AuthCheckedMW,edit_bank_list)
Sadmin.post('/edit_bank_save',AuthCheckedMW,edit_bank_list_save)
Sadmin.get('/inactive_bank',AuthCheckedMW,inactive_bank_list)
Sadmin.get("/edit_inactive_bank_list",AuthCheckedMW,edit_inactive_bank_list);
Sadmin.post("/save_inactive_bank",AuthCheckedMW,edit_inactive_bank_list_save);

Sadmin.get('/report',AuthCheckedMW,report_list)
Sadmin.post('/report_branch_name',AuthCheckedMW,get_branch_name)
Sadmin.post('/agent_data_report',AuthCheckedMW,agent_report)
Sadmin.post('/summary_report_post_admin',AuthCheckedMW,summary_report_post_admin)


Sadmin.get('/collection_report',AuthCheckedMW,col_report_list)
Sadmin.post('/collection_report_update',AuthCheckedMW,collection_report)

Sadmin.get('/collection_progress',AuthCheckedMW,col_progress)
Sadmin.post('/collection_progress_update',AuthCheckedMW,collection_progress)


module.exports={Sadmin}