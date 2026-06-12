const offlineApiRouter = require('express').Router();
const { search_account, get_acc_prev_col, account_info } = require('../../controller/offline/accountDetails');
const { receiveCollection, endcollectionCheckUser } = require('../../controller/offline/transaction');
const { my_agent, login, getAgentPrintType } = require('../../controller/offline/userAuth');


//register account 
offlineApiRouter.post('/my_agent', my_agent)
//login account
offlineApiRouter.post('/login', login)
offlineApiRouter.post('/get_agent_printer_type', getAgentPrintType)
//Search account
offlineApiRouter.post('/search_account', search_account)
offlineApiRouter.post('/get_acc_prev_col', get_acc_prev_col)
//Search account
offlineApiRouter.post('/account_info', account_info)

offlineApiRouter.post('/receive_collection', endcollectionCheckUser, receiveCollection)

module.exports = { offlineApiRouter };