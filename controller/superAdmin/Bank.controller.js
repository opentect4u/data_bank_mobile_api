const Joi = require("joi");
const { db_Select, db_Insert } = require("../../model/MasterModule");
const dateFormat = require('dateformat');
const bcrypt = require('bcrypt');

const bank_list = async (req, res) => {
    var bank = await db_Select('*', "md_bank", null, null);
    const viewData = {
        title: "Adminn",
        page_path: "/bank/viewBank",
        data: bank
    };
    res.render('common/layouts/main', viewData)
}


const add_bank_list = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_name: Joi.string().required(),
            contact_person: Joi.string().required(),
            mobile: Joi.number().required(),
            bank_address: Joi.string().required(),
            email: Joi.string().required(),
            device_type: Joi.string().required(),
            data_version: Joi.string().valid('S', 'C', 'N').required(),
            data_transfer_type: Joi.string().valid('M', 'A').required(),
            receipt_type: Joi.string().valid('S', 'P', 'B').required(),
            active_flag: Joi.string().valid('Y', 'N').required(),
            password: Joi.string().required(),
            confirmPassword: Joi.string().required().valid(Joi.ref('password')),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });

            req.flash('error', errors)
            res.redirect('/super-admin/bank')

            // return res.status(400).json({ error: errors });
        }


        let pss = value.password
        let enc_pss = bcrypt.hashSync(pss, 10)



        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const user_data = req.session.user.user_data.msg[0];
        var fields = `(bank_name, bank_address, contact_person, phone_no, email_id, device_type, data_version, data_trf, receipt_type, created_by, created_at, active_flag)`,
            values = `('${value.bank_name}','${value.bank_address}','${value.contact_person}','${value.mobile}','${value.email}','${value.device_type}','${value.data_version}','${value.data_transfer_type}','${value.receipt_type}','${user_data.id}','${datetime}','${value.active_flag}')`
        var insmd_bank=await db_Insert("md_bank", fields, values, null, 0)
 var adduser='';
        if(insmd_bank.lastId.insertId){
            var fields = `( bank_id, user_type, password, user_id, active_flag, created_by, created_at)`,
            values = `('${insmd_bank.lastId.insertId}','B','${enc_pss}','${value.email}','Y','${user_data.id}','${datetime}')`
            var adduser=  await db_Insert("md_user", fields, values, null, 0)
        }
		//res.send({insmd_bank:insmd_bank,adduser:adduser});
        req.flash('success', "Bank Add Successful")
        res.redirect('/super-admin/bank')

    } catch (error) {
        req.flash('error', error)
        res.redirect('/super-admin/bank')
        // return res.status(400).json({ error: error });
    }


}

const edit_bank_list = async (req, res) => {
    var data = await db_Select('*', 'md_bank', `bank_id=${req.query.bank_id}`, null)
    // console.log(data, 'lalal');
    const viewData = {
        title: "Adminn",
        page_path: "/bank/edit_viewBank",
        data: data.suc > 0 && data.msg.length > 0 ? data.msg[0] : [],
        bank_id: req.query.bank_id,
    };
    res.render('common/layouts/main', viewData)
}
const edit_bank_list_save = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_name: Joi.string().required(),
            contact_person: Joi.string().required(),
            mobile: Joi.number().required(),
            bank_address: Joi.string().required(),
            email: Joi.string().required(),
            device_type: Joi.string().required(),
            data_version: Joi.string().valid('S', 'C', 'N').required(),
            data_transfer_type: Joi.string().valid('M', 'A').required(),
            receipt_type: Joi.string().valid('S', 'P', 'B').required(),
            active_flag: Joi.string().valid('Y', 'N').required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });

            // req.flash('error', errors)
            res.redirect('/super-admin/bank')

            // return res.status(400).json({ error: errors });
        }

        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const user_data = req.session.user.user_data.msg[0];
        // console.log(user_data);
        var table_name = 'md_bank',
        fields = `bank_name ='${value.bank_name}', bank_address = '${value.bank_address}', contact_person = '${value.contact_person}', phone_no = '${value.mobile}', email_id ='${value.email}', device_type = '${value.device_type}', data_version = '${value.data_version}', data_trf = '${value.data_transfer_type}', 
        receipt_type = '${value.receipt_type}', sec_amt_type = '${value.sucurity_amt_type}', active_flag = '${value.active_flag}', after_maturity_coll = '${value.after_maturity_coll}', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
        values = null
        whr=`bank_id=${value.bank_id}`
        var insmd_bank = await db_Insert(table_name, fields, values, whr, 1)
        // req.flash('success', "Bank Add Successful")
        res.redirect('/super-admin/bank')

    } catch (error) {
        // req.flash('error', error)
        // res.redirect('/super-admin/bank')
        // return res.status(400).json({ error: error });
    }

}






module.exports = { bank_list, add_bank_list,edit_bank_list,edit_bank_list_save}