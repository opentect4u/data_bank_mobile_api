const Joi = require('joi');
const bcrypt = require('bcrypt');
const { db_Insert } = require('../../model/MasterModule');
const dateFormat = require('dateformat');

const dashboard = async (req, res) => {
    
    var viewData={
        title:"Dashboard",
        page_path:"/dashboard/dashboard",
        data:""
    };
    res.render('common/layouts/main',viewData)
}


module.exports = { dashboard }