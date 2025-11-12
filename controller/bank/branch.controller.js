const Joi = require("joi");
const { db_Select, db_Insert } = require("../../model/MasterModule");
const dateFormat = require('dateformat');
const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
const bcrypt = require('bcrypt');

const branch_list=async (req,res)=>{
    try {
        const user_data = req.session.user.user_data.msg[0];
        let select = 'a.*',
            table_name = 'md_branch AS a, md_user as b',
            whr = `a.bank_id=${user_data.bank_id} AND a.branch_code=b.branch_code AND a.bank_id='${user_data.bank_id}' AND b.bank_id='${user_data.bank_id}' AND b.user_type='R'`;
        const resData = await db_Select(select, table_name, whr, null)
        // console.log("======///////////=======",resData)
        delete resData.sql
        var viewData = {
            title: "Branch",
            page_path: "/branch/listbranch",
            data: resData
        };
        res.render('common/layouts/main', viewData)
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}

const add_branch=async (req,res)=>{
    try {
        const schema = Joi.object({
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
        const user_data = req.session.user.user_data.msg[0];



        let fields2 = '(bank_id, branch_code, user_type, password, user_id, active_flag, created_by, created_at, delete_flag, profile_pic)',
        values2 = `('${user_data.bank_id}','${value.branch_c}','R','${enc_pss}','${value.email}','N','${user_data.id}','${datetime}','N','')`;
        let res_dt2 = await db_Insert("md_user", fields2, values2, null, 0);
        console.log('========user==========',res_dt2)

        let fields = '(bank_id, branch_code, branch_name, branch_address, contact_person, phone_no, email_id, created_by, created_at, delete_flag, active_flag)',
            values = `('${user_data.bank_id}','${value.branch_c}','${value.branchname}','${value.branch_address}','${value.contactperson}','${value.mobile}','${value.email}','${user_data.id}','${datetime}','N','N')`;
        let res_dt = await db_Insert("md_branch", fields, values, null, 0);
        console.log('========branch==========',res_dt)
        res.redirect('/bank/branch')
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}


const editBranch = async (req, res) => {
    try {
        const branchid=req.params.branchid
        
        const user_data = req.session.user.user_data.msg[0];
        let select = 'a.*,b.*',
            table_name = 'md_branch AS a,md_user as b',
            whr = `a.branch_code=b.branch_code AND a.branch_id='${branchid}' AND a.bank_id='${user_data.bank_id}' AND b.user_type='R'`;
        const resData = await db_Select(select, table_name, whr, null)
        console.log('========branch==========',resData);
        delete resData.sql
        var viewData = {
            title: "Edit Branch",
            page_path: "/branch/editViewBranch",
            data: resData.msg
        };
        res.render('common/layouts/main', viewData)
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}



const updatedata_branch=async (req,res)=>{
    try {
        const schema = Joi.object({
            branch_c: Joi.required(),
            branchname: Joi.string().required(),
            contactperson: Joi.string().required(),
            email: Joi.string().required(),
            mobile: Joi.string().required(),
            branch_address: Joi.required(),
            branch_id:Joi.required(),
            user_id:Joi.required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
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



        let fields2 = `bank_id='${user_data.bank_id}', branch_code='${value.branch_c}', user_id='${value.email}', created_by='${user_data.id}'`,
        where=`id=${value.user_id} AND bank_id='${user_data.bank_id}' AND branch_code='${value.branch_c}'`;
        let res_dt2 = await db_Insert("md_user", fields2, null, where, 1);
        // db_Insert = (table_name, fields, values, whr, flag)

        let fields = `bank_id='${user_data.bank_id}', branch_code='${value.branch_c}', branch_name='${value.branchname}', branch_address='${value.branch_address}', contact_person='${value.contactperson}', phone_no='${value.mobile}', email_id='${value.email}'`,
            where2=`branch_id=${value.branch_id} AND branch_code='${value.branch_c}' AND bank_id =${user_data.bank_id}`;
        let res_dt = await db_Insert("md_branch", fields, null, where2, 1);
        res.redirect('/bank/branch')
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}
module.exports={branch_list,add_branch,editBranch,updatedata_branch}