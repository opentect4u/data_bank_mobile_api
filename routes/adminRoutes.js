const express=require("express");
const { login, post_login, blank_page } = require("../controller/admin/authAdmin");
const { dashboard } = require("../controller/admin/Dashboard");
const { AuthCheckedMW, logout } = require("../middleware/AuthCheckedMW");
const { upload_pctx, upload_pctx_file_data, download_pcrx, download_pcrx_file, create_agent_trans, show_upload_account, fetch_show_account, del_all_pctx_file_data, fetchdata_to_server, fetch_pcrx_file, update_agent_amount } = require("../controller/admin/UploadDownloadTxtFile");
const { check_and_collection, settings, check_sync_data } = require("../controller/admin/AdminTransaction");
const { day_scroll_report, day_scroll_report_post, account_type_wise_report, account_type_wise_report_post, individual_day_scroll_report_post, individual_day_scroll_report, summary_report, summary_report_post, acc_type_list_ajax } = require("../controller/admin/AdminReport");
const { agent_info, fetchtransNumber, fetch_account } = require("../controller/admin/FetchData");
const { agent, addAgent, editAgent, edit_save_agent, checkedUnicUser, fetch_agent_max_all_col, fetch_agent_name, col_days, col_days_save } = require("../controller/admin/Agent.controller");

const AdminRoutes = express.Router()

// AdminRoutes.use((req, res, next) => {
//     req.session['user'] = {id: 1, name: 'Amit', ShortCode: 'Laora'}
//     console.log(req.session);
//     // req.session.user = '';
//     // req.session.distroy()
//     next()
// })

AdminRoutes.get('/login',login)
AdminRoutes.post('/login',post_login)
AdminRoutes.get('/logout',logout)

AdminRoutes.get('/blank_page',blank_page)


AdminRoutes.get('/dashboard',AuthCheckedMW,dashboard)


AdminRoutes.get('/upload_pctx',AuthCheckedMW,upload_pctx)
AdminRoutes.post('/create_agent_trans',AuthCheckedMW,create_agent_trans)
AdminRoutes.post('/update_agent_amount',AuthCheckedMW,update_agent_amount)
AdminRoutes.post('/upload_pctx_file_data',AuthCheckedMW,upload_pctx_file_data)
AdminRoutes.post('/del_all_pctx_file_data',AuthCheckedMW,del_all_pctx_file_data)
AdminRoutes.post('/fetch_trans_number',AuthCheckedMW,fetchtransNumber)

AdminRoutes.post('/fetchdata_to_server',AuthCheckedMW,fetchdata_to_server)


AdminRoutes.get('/download_pcrx',AuthCheckedMW,download_pcrx)
AdminRoutes.get('/download_pcrx_file',AuthCheckedMW,download_pcrx_file)
AdminRoutes.get('/fetch_pcrx_file',AuthCheckedMW,fetch_pcrx_file)
AdminRoutes.post('/check_and_collection',AuthCheckedMW,check_and_collection)


AdminRoutes.post('/check_sync_data',AuthCheckedMW,check_sync_data)


AdminRoutes.get('/day_scroll_report',AuthCheckedMW,day_scroll_report)
AdminRoutes.post('/day_scroll_report_post',AuthCheckedMW,day_scroll_report_post)


 AdminRoutes.get('/summary_report',AuthCheckedMW,summary_report)
 AdminRoutes.post('/summary_report_post',AuthCheckedMW,summary_report_post)

AdminRoutes.get('/individual_day_scroll_report',AuthCheckedMW,individual_day_scroll_report)
AdminRoutes.post('/individual_day_scroll_report_post',AuthCheckedMW,individual_day_scroll_report_post)
AdminRoutes.post('/fetch_account',AuthCheckedMW,fetch_account)

AdminRoutes.get('/account_type_wise_report',AuthCheckedMW,account_type_wise_report)
AdminRoutes.post('/account_type_wise_report_post',AuthCheckedMW,account_type_wise_report_post)


AdminRoutes.get('/show_upload_account',AuthCheckedMW,show_upload_account)
AdminRoutes.post('/fetch_show_account',AuthCheckedMW,fetch_show_account)
AdminRoutes.post('/agent_info',AuthCheckedMW,agent_info)


AdminRoutes.get('/agent',AuthCheckedMW,agent)
AdminRoutes.get('/col_days',AuthCheckedMW,col_days)
AdminRoutes.post('/col_days',AuthCheckedMW,col_days_save)
AdminRoutes.post('/fetch_agent_max_all_col',AuthCheckedMW,fetch_agent_max_all_col)
AdminRoutes.post('/fetch_agent_name',AuthCheckedMW,fetch_agent_name)
AdminRoutes.post('/add_agent',AuthCheckedMW,addAgent)
AdminRoutes.post('/checkedUnicUser',AuthCheckedMW,checkedUnicUser)
AdminRoutes.get('/edit_agent/:agent_id',AuthCheckedMW,editAgent)
AdminRoutes.post('/update_agent/:agent_id',AuthCheckedMW,edit_save_agent)

AdminRoutes.post('/acc_type_list_ajax', AuthCheckedMW, acc_type_list_ajax)


// AdminRoutes.get('/edit_settings/:agent_id',AuthCheckedMW,editSetting)


module.exports={AdminRoutes};