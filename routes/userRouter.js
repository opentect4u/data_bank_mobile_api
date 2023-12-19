const express=require("express");
const { register, login, my_agent, change_pin, app_version } = require("../controller/api/UserAuth");
const { search_account, account_info } = require("../controller/api/AccountInfo");
const { transaction, end_collection, now_date, collection_checked, total_collection } = require("../controller/api/Transaction");
const { endcollectionMW } = require("../middleware/EndcollectionMW");
const { day_scroll_report, type_wise_report, non_collection_report, mini_statement, date_wise_summary, date_wise_mini_statement, account_wise_scroll_report, last_five_transaction } = require("../controller/api/ApiReport");

const UserRouter = express.Router();
//find account No
UserRouter.post('/register',register)
//register account 
UserRouter.post('/my_agent',my_agent)
//login account
UserRouter.post('/login',login)
UserRouter.post('/change_pin',change_pin)
//Search account
UserRouter.post('/search_account',search_account)
//Search account
UserRouter.post('/account_info',account_info)


//Transaction
UserRouter.post('/transaction',transaction)
//end collection
UserRouter.post('/end_collection',endcollectionMW,end_collection)
//end collection
UserRouter.get('/now_date',now_date)

//end collection checked
UserRouter.post('/collection_checked',collection_checked)

UserRouter.post('/total_collection',total_collection)

UserRouter.post('/day_scroll_report',day_scroll_report)
UserRouter.post('/type_wise_report',type_wise_report)
UserRouter.post('/non_collection_report',non_collection_report)
UserRouter.post('/mini_statement',mini_statement)

UserRouter.post('/date_wise_summary',date_wise_summary)
UserRouter.post('/date_wise_mini_statement',date_wise_mini_statement)
UserRouter.post('/account_wise_scroll_report',account_wise_scroll_report)


UserRouter.post('/last_five_transaction',last_five_transaction)



UserRouter.post('/app_version',app_version);


module.exports={UserRouter};