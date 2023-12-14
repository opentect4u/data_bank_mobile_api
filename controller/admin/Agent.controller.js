const Joi = require('joi');
const bcrypt = require('bcrypt');
const dateFormat = require('dateformat');
const { db_Insert, db_Select } = require('../../model/MasterModule');
const { F_Select } = require('../../model/OrcModel');
const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
//login View
const agent = async (req, res) => {
    try {
        const user_data = req.session.user.user_data.msg[0];
        let select = 'a.id, a.user_id,a.active_flag,a.device_id,a.device_sl_no,b.agent_name,b.agent_address,b.phone_no,b.email_id,b.max_amt',
            table_name = 'md_user as a, md_agent as b',
            whr = `a.user_id=b.agent_code AND a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}' AND b.bank_id='${user_data.bank_id}' AND b.branch_code='${user_data.branch_code}' AND a.user_type='O'`;
        const resData = await db_Select(select, table_name, whr, null)
        delete resData.sql
        var viewData = {
            title: "Agent",
            page_path: "/agent/viewAgent",
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
//create account
const addAgent = async (req, res) => {
    try {
        const schema = Joi.object({
            user_id: Joi.required(),
            name: Joi.string().required(),
            email: Joi.string().required(),
            mobile: Joi.string().required(),
            agent_account_no: Joi.string(),
            max_amt: Joi.number().required(),
            allow_collection_days: Joi.number().required(),
            password: Joi.string().required(),
            confirmPassword: Joi.string().required().valid(Joi.ref('password')),
            device_id: Joi.required(),

            // device_sl_no: Joi.required(),
            // adress: Joi.string().required(),
           
            // profile_pic: Joi.required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        let pss = value.password
        let enc_pss = bcrypt.hashSync(pss, 10)
        const user_data = req.session.user.user_data.msg[0];
        let fields = '(bank_id, branch_code, user_type,password, device_id, user_id, active_flag, created_by, created_at, delete_flag)',
            values = `('${user_data.bank_id}','${user_data.branch_code}','O','${enc_pss}','${value.device_id}','${value.user_id}','N','${user_data.id}','${datetime}','N')`;
        let res_dt = await db_Insert("md_user", fields, values, null, 0);


        let fields2 = '(bank_id, branch_code, agent_code,agent_name, phone_no, email_id,max_amt,account_no,allow_collection_days,created_by,created_at,delete_flag)',

            values2 = `('${user_data.bank_id}','${user_data.branch_code}','${value.user_id}','${value.name}','${value.mobile}','${value.email}','${value.max_amt}','${value.agent_account_no}','${value.allow_collection_days}','${user_data.id}','${datetime}','N')`;

        let res_dt2 = await db_Insert("md_agent", fields2, values2, null, 0);
		//res.send({res_dt:res_dt,res_dt2:res_dt2})
        res.redirect('/admin/agent')
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}
const editAgent = async (req, res) => {
    try {
        const user_data = req.session.user.user_data.msg[0];
        let select = 'b.allow_collection_days,a.id, a.user_id,a.active_flag,a.device_id,a.device_sl_no,b.agent_name,b.agent_address,b.phone_no,b.email_id,b.max_amt,b.account_no',
            table_name = 'md_user as a, md_agent as b',
            whr = `a.user_id=b.agent_code AND a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}' AND b.bank_id='${user_data.bank_id}' AND b.branch_code='${user_data.branch_code}' AND a.user_type='O' AND a.id=${req.params['agent_id']}`;
        const resData = await db_Select(select, table_name, whr, null)
        delete resData.sql
        var viewData = {
            title: "Agent",
            page_path: "/agent/editViewAgent",
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
const edit_save_agent = async (req, res) => {
    try {
        const schema = Joi.object({
            user_id: Joi.required(),
            name: Joi.string().required(),
            email: Joi.string().required(),
            mobile: Joi.string().required(),
            max_amt: Joi.number().required(),
            allow_collection_days:Joi.number().required(),
            device_id: Joi.required(),

            // device_sl_no: Joi.required(),
            // adress: Joi.string().required(),

        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const user_data = req.session.user.user_data.msg[0];
        let fields = `device_id='${value.device_id}',modified_by='${user_data.id}',updated_at='${datetime}'`,
            whr1 = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'AND user_id='${value.user_id}' AND id='${req.params['agent_id']}'`;
        let res_dt = await db_Insert("md_user", fields, null, whr1, 1);
        let fields2 = `agent_name='${value.name}', phone_no='${value.mobile}', email_id='${value.email}',max_amt='${value.max_amt}',allow_collection_days='${value.allow_collection_days}',modified_by='${user_data.id}',updated_at='${datetime}'`,
            whr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'AND agent_code='${value.user_id}'`;
        let res_dt2 = await db_Insert("md_agent", fields2, null, whr, 1);
        res.redirect('/admin/agent')
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}



const checkedUnicUser = async (req, res) => {
    try {
        const user_data = req.session.user.user_data.msg[0];
        let select = 'a.*',
            table_name = 'md_user as a',
            whr = `a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}' a.user_type='O' AND a.id=${req.params['agent_id']}`;
        const resData = await db_Select(select, table_name, whr, null)
        delete resData.sql


        
    } catch (error) {
        res.json(false);
    }
}

const fetch_agent_max_all_col= async (req, res) => {
    try {

        const schema = Joi.object({
            agent_account_no: Joi.required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const user_data = req.session.user.user_data.msg[0];

        //db connection
        let fields = "clr_bal",
            table_name = "TM_DEPOSIT",
            where = `acc_type_cd =1 AND acc_num = '${value.agent_account_no}'`,
            order = null,
            flag = 1;
        let tableDate = await F_Select(user_data.bank_id, fields, table_name, where, order, flag, full_query = null);

        res.json(tableDate);
        
    } catch (error) {
        res.json(false);
    }
}




const fetch_agent_name= async (req, res) => {
    try {

        const schema = Joi.object({
            agent_c: Joi.required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const user_data = req.session.user.user_data.msg[0];

        //db connection
        let fields = "AGENT_NAME",
            table_name = "MM_AGENT",
            where = `agent_cd = '${value.agent_c}'`,
            order = null,
            flag = 1;
        let tableDate = await F_Select(user_data.bank_id, fields, table_name, where, order, flag, full_query = null);

        res.json(tableDate);
        
    } catch (error) {
        res.json(false);
    }
}

module.exports = { agent, addAgent, editAgent, edit_save_agent,checkedUnicUser,fetch_agent_max_all_col,fetch_agent_name}