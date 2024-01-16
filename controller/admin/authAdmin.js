const Joi = require('joi');
const bcrypt = require('bcrypt');
const { db_Select } = require('../../model/MasterModule');
const dateFormat = require('dateformat');

//login View
const login = async (req, res) => {
    if (!req.session.user)
        try {
            res.render('auth/login')
        } catch (error) {
            res.json({
                "error": error,
                "status": false
            });
        }
    // else res.redirect('/admin/dashboard')
    else res.redirect('/super-admin/summary')
}
//login 
const post_login = async (req, res) => {
    try {
        
    const user_id = req.body.email,
        password = req.body.password;
    var whr = `user_id='${user_id}' AND active_flag='Y' AND user_type IN ('A', 'B', 'R')`;
    let res_dt = await db_Select('password,user_type', "md_user", whr, null);
    delete res_dt.sql;
    if (res_dt.msg[0] && await bcrypt.compare(password, res_dt.msg[0].password)) {

        if(res_dt.msg[0].user_type=='R'){
            var table_name = "md_user a,md_bank b,md_branch c",
            whrDAta = `a.bank_id=b.bank_id AND a.branch_code=c.branch_code AND b.bank_id=c.bank_id AND a.user_id='${user_id}' AND a.active_flag='Y'`,
            selectData = "a.user_type,c.branch_address,c.email_id,c.phone_no,a.id, a.bank_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic , c.branch_name,b.*";
        }else if(res_dt.msg[0].user_type=='B'){
            var table_name = "md_user a,md_bank b",
            whrDAta = `a.bank_id=b.bank_id AND a.user_id='${user_id}' AND a.active_flag='Y'`,
            selectData = "a.user_type,a.id, a.bank_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic,b.*";
        }else if(res_dt.msg[0].user_type=='A'){
            var table_name = "md_user a",
            whrDAta = `a.user_id='${user_id}' AND a.active_flag='Y'`,
            selectData = "a.user_type,a.id, a.bank_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic";
        }


        



        let user_data = await db_Select(selectData, table_name, whrDAta, null);
        console.log("=================================",user_data)
        delete user_data.sql;
        
    const datetime = dateFormat(new Date(), "dd/mm/yyyy hh:MM:ss")
        req.session['user'] = {user_data,datetime}
        req.flash('success', 'login successful')
        // res.redirect('/admin/dashboard')
        res.redirect('/super-admin/summary')
    } else {
        req.flash('error', 'invalid username and password')
        res.redirect('/admin/login')
        // res.json({
        //     "ERROR": "Password Miss Match",
        //     "status": true
        // });
    }


} catch (error) {
    res.json({
        "ERROR": error,
        "status": true
    });
}
}





const blank_page = async (req, res) => {
    try {
        res.render('index')
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}


module.exports = { login, post_login, blank_page }