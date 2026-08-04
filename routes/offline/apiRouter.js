const offlineApiRouter = require('express').Router();
const { search_account, get_acc_prev_col, account_info } = require('../../controller/offline/accountDetails');
const { receiveCollection, endcollectionCheckUser, checkOfflineSyncStatus } = require('../../controller/offline/transaction');
const { my_agent, login, getAgentPrintType, register, challenge } = require('../../controller/offline/userAuth');


//register device/account
offlineApiRouter.post('/register', register);
//get login challenge
offlineApiRouter.post('/challenge', challenge);
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

offlineApiRouter.post('/check_offline_sync_status', checkOfflineSyncStatus)

module.exports = { offlineApiRouter };