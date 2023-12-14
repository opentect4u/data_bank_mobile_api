// ServerRoures
const express=require("express");
const { bccs_api } = require("../controller/bankServerApi/serverToAgent");
const ServerRoures = express.Router();

ServerRoures.post('/bccs_agent_deposit',bccs_api)

module.exports={ServerRoures}