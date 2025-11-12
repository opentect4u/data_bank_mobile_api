const Joi = require("joi");
const bcrypt = require('bcrypt');
const dateFormat = require('dateformat')
const { db_Select, db_Insert } = require("../../model/MasterModule");

const branch_list = async (req, res) => {
    try {
        var bank = await db_Select('*', "md_bank", null, null);
        const viewData = {
            title: "Admin",
            page_path: "/branch_admin/view_branch",
            bank : bank
        };
        res.render('common/layouts/main', viewData)
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    } 

}


const add_branch_admin=async (req,res)=>{
    try {
        const schema = Joi.object({
            bank_id: Joi.required(),
            branch_c: Joi.required(),
            branchname: Joi.string().required(),
            contactperson: Joi.string().required(),
            email: Joi.string().required(),
            mobile: Joi.string().required(),
            password: Joi.string().required(),
            confirmPassword: Joi.string().required().valid(Joi.ref('password')),
            branch_address: Joi.required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        let pss = value.password
        let enc_pss = bcrypt.hashSync(pss, 10)
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const user_data = req.session.user.user_data.msg[0];



        let fields2 = '(bank_id, branch_code, user_type, password, user_id, active_flag, created_by, created_at, delete_flag, profile_pic)',
        values2 = `('${value.bank_id}','${value.branch_c}','R','${enc_pss}','${value.email}','N','${user_data.id}','${datetime}','N','')`;
        let res_dt2 = await db_Insert("md_user", fields2, values2, null, 0);
        console.log('========user==========',res_dt2)

        let fields = '(bank_id, branch_code, branch_name, branch_address, contact_person, phone_no, email_id, created_by, created_at, delete_flag, active_flag)',
            values = `('${value.bank_id}','${value.branch_c}','${value.branchname}','${value.branch_address}','${value.contactperson}','${value.mobile}','${value.email}','${user_data.id}','${datetime}','N','N')`;
        let res_dt = await db_Insert("md_branch", fields, values, null, 0);
        console.log('========branch==========',res_dt)
        res.redirect('/super-admin/branch_admin')
    } catch (error) {
        console.log(error);
        res.json({
            "error": error,
            "status": false
            
        });
    }
}

const edit_branch_list = async (req, res) => {
    console.log(req.query.branch_id);
    var data = await db_Select('*', 'md_branch', `branch_id=${req.query.branch_id}`, null)
    console.log(data, 'lalal');
    const viewData = {
        title: "Adminn",
        page_path: "/branch_admin/edit_View_Branch",
        data: data.suc > 0 && data.msg.length > 0 ? data.msg[0] : [],
        branch_id: req.query.branch_id,
    };
    console.log(viewData);
    res.render('common/layouts/main', viewData)
}



const updatedata_branch=async (req,res)=>{
    try {
        const schema = Joi.object({
            bank_id: Joi.required(),
            branch_c: Joi.required(),
            branchname: Joi.string().required(),
            contactperson: Joi.string().required(),
            email: Joi.string().required(),
            mobile: Joi.string().required(),
            branch_address: Joi.required(),
            branch_id:Joi.required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        // console.log(value);
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        // let pss = value.password
        // let enc_pss = bcrypt.hashSync(pss, 10)
        const user_data = req.session.user.user_data.msg[0];




        let fields2 = `bank_id='${value.bank_id}', branch_code='${value.branch_c}', user_id='${value.email}', created_by='${user_data.id}'`,
        where=`bank_id='${value.bank_id}' AND branch_code='${value.branch_c}'`;
        let res_dt2 = await db_Insert("md_user", fields2, null, where, 1);
        // console.log(res_dt2);
        // db_Insert = (table_name, fields, values, whr, flag)

        let fields = `bank_id='${value.bank_id}', branch_code='${value.branch_c}', branch_name='${value.branchname}', branch_address='${value.branch_address}', contact_person='${value.contactperson}', phone_no='${value.mobile}', email_id='${value.email}'`,
            where2=`branch_id='${value.branch_id}'`;
        let res_dt = await db_Insert("md_branch", fields, null, where2, 1);
        // console.log(res_dt);
        res.redirect('/super-admin/branch_admin')
    } catch (error) {
        console.log(error);
        res.json({
            "error": error,
            "status": false
        });
    }
}

module.exports = {branch_list,add_branch_admin,updatedata_branch, edit_branch_list}