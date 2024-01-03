const express=require("express");
const { dashboard } = require("../controller/admin/Dashboard");
const { agent_list } = require("../controller/superAdmin/Agent.controller");
const { AuthCheckedMW } = require("../middleware/AuthCheckedMW");
const { fetch_bank_info } = require("../controller/superAdmin/FetchData.controller");
const { bank_list, add_bank_list, edit_bank_list, edit_bank_list_save, admin_bank_list } = require("../controller/superAdmin/Bank.controller");

const Sadmin = express.Router()


Sadmin.get('/',dashboard)
Sadmin.get('/agent',AuthCheckedMW,agent_list)
Sadmin.post('/fetch_bank_info',AuthCheckedMW,fetch_bank_info)



Sadmin.get('/bank',AuthCheckedMW,bank_list)
Sadmin.post('/add_bank',AuthCheckedMW,add_bank_list)
Sadmin.get('/edit_bank', edit_bank_list)
Sadmin.post('/edit_bank_save', edit_bank_list_save)

// Sadmin.get('/admin_branch')

module.exports={Sadmin}