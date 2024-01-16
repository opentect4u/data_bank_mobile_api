const Joi = require("joi");
const bcrypt = require('bcrypt')
const dateFormat = require('dateformat')
const { db_Select, db_Insert } = require("../../model/MasterModule");

const agent_list=async(req,res)=>{
    try {
        var bank = await db_Select('*', "md_bank", null, null);
        const viewData = {
            title: "Admin",
            page_path: "/agent/viewAgent_super_admin",
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

const agent = async (req, res) => {
    try {
        var data = req.body
        let select = 'agent_id, agent_code, agent_name, phone_no',
            table_name = 'md_agent',
            whr = `bank_id = ${data.bank_id} AND branch_code = ${data.branch_id} AND active_flag='${data.flag}'`;
        var resData = await db_Select(select, table_name, whr, null)
        // console.log(resData);
        res.json(resData)
        
    } catch (error) {
        res.json({
            "suc": 0,
            "msg": []
        });
    }
}

const add_agent = async (req, res) => {
    try {
      const schema = Joi.object({
        bank: Joi.required(),
        branch_c: Joi.required(),
        user_id: Joi.required(),
        name: Joi.string().required(),
        email: Joi.string().required(),
        mobile: Joi.string().required(),
        max_amt: Joi.number().required(),
        allow_collection_days: Joi.number().required(),
        device_id: Joi.required(),
        agent_active: Joi.string(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().required().valid(Joi.ref('password')),
      });
      const { error, value } = schema.validate(req.body, { abortEarly: false });
    //   console.log(value);
      if (error) {
        const errors = {};
        error.details.forEach((detail) => {
          errors[detail.context.key] = detail.message;
        });
        return res.json({ error: errors });
      }

      let pss = value.password
      let enc_pss = bcrypt.hashSync(pss, 10)
      const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
      const user_data = req.session.user.user_data.msg[0];
    //   console.log(user_data);
  
      let fields2 = '(bank_id,branch_code,password,user_id,device_id,active_flag,created_by,created_at)',
        values2 = `('${value.bank}','${value.branch_c}','${enc_pss}','${value.user_id}','${value.device_id}','${value.agent_active}','${user_data.id}','${datetime}')`;
      let res_dt2 = await db_Insert("md_user", fields2, values2, null, 0);
    //   console.log("========user==========", res_dt2);
  
      let fields = '(bank_id, branch_code,agent_code,agent_name,phone_no,email_id,max_amt,allow_collection_days,created_by,created_at)',
        values = `('${value.bank}','${value.branch_c}','${value.user_id}','${value.name}','${value.mobile}','${value.email}','${value.max_amt}','${value.allow_collection_days}','${user_data.id}','${datetime}')`;
      let res_dt = await db_Insert("md_agent", fields, values, null, 0);
    //   console.log("========branch==========", res_dt);
      res.redirect("/super-admin/agent");
    } catch (error) {
    //   console.log(error);
      res.json({
        error: error,
        status: false,
      });
    }
  };

const editAgentdata = async (req, res) => {
        // console.log(req.query.agent_id);
        let select = 'a.agent_id,a.agent_code,a.branch_code,a.agent_name,a.phone_no,a.email_id,a.max_amt,a.allow_collection_days,a.bank_id,b.device_sl_no,b.device_id,b.active_flag,b.id,b.user_id,c.branch_name',
            table_name = 'md_agent a, md_user b, md_branch c',
            whr = `a.agent_code= b.user_id
            AND a.bank_id = b.bank_id
            AND a.branch_code = b.branch_code
            AND c.branch_code = a.branch_code
            and c.bank_id = a.bank_id
            AND a.agent_id = ${req.query.agent_id}`;
        const resData = await db_Select(select, table_name, whr, null)
        // console.log(resData);
        delete resData.sql
        var viewData = {
            title: "Agent",
            page_path: "/agent/editView_super_admin",
            data: resData.suc > 0 && resData.msg.length > 0 ? resData.msg[0] : [],
            agent_id : req.query.agent_id
        };
        // console.log(viewData);
        res.render('common/layouts/main', viewData)

}


const edit_save_agent_data = async (req, res) => {
        try {
            const schema = Joi.object({
                bank: Joi.required(),
                branch_c: Joi.required(),
                user_id: Joi.required(),
                name: Joi.string().required(),
                email: Joi.string().required(),
                mobile: Joi.string().required(),
                max_amt: Joi.number().required(),
                allow_collection_days: Joi.number().required(),
                device_id: Joi.required(),
                agent_active: Joi.string(),
                agent_id: Joi.required()
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
            
            const user_data = req.session.user.user_data.msg[0];
            const datetime = dateFormat(new Date(), "yyyy-mm-dd")
            
    
    
    
            let fields =  `device_id='${value.device_id}',active_flag='${value.agent_active ? value.agent_active : "N"}',modified_by='${user_data.id}',updated_at='${datetime}'`,
            where=`bank_id='${value.bank}' AND user_id='${value.user_id}'`;
            let res_dt2 = await db_Insert("md_user", fields, null, where, 1);
            // console.log(res_dt2);
    
            let fields2 = `agent_name='${value.name}', phone_no='${value.mobile}', email_id='${value.email}',max_amt='${value.max_amt}',allow_collection_days='${value.allow_collection_days}',modified_by='${user_data.id}',updated_at='${datetime}'`,
            where2=`agent_id='${value.agent_id}'`;
            let res_dt = await db_Insert("md_agent", fields2, null, where2, 1);
            // console.log(res_dt);
            res.redirect('/super-admin/agent')
        } catch (error) {
            // console.log(error);
            res.json({
                "error": error,
                "status": false
            });
        }
    
}


const total_user = async (req, res) => {
  
    var data = req.body

    var select = 'active_flag,COUNT(*) tot_dt',
    table_name = 'md_agent',
    whr = `bank_id = ${data.bank_id} AND active_flag='Y'`
    order = null;
    var active_resData = await db_Select(select,table_name,whr,order)
    // res.json(active_resData)
 

    var select = 'active_flag,COUNT(*) tot_dt',
    table_name = 'md_agent',
    whr = `bank_id = ${data.bank_id} AND active_flag='N'`
    order = null;
    var inactive_resData = await db_Select(select,table_name,whr,order)
    var final_res = {suc: 1, msg: {act_dt: active_resData.suc > 0 && active_resData.msg.length > 0 ? active_resData.msg[0].tot_dt : 0, deact_dt: inactive_resData.suc > 0 && inactive_resData.msg.length > 0 ? inactive_resData.msg[0].tot_dt : 0}}
    res.json(final_res)
 
}

const bank_name_sms = async (req, res) => {
  var bank = await db_Select('*','md_bank',null,null);
  const viewData = {
      title: "Adminn",
      page_path: "/sms/sms",
      data: bank
  };
  res.render('common/layouts/main', viewData)
} 

const sms_url = async (req, res) => {
    var data = req.body

    var select = 'bank_id,template',
    table_name = 'md_sms',
    whr = `bank_id = ${data.bank_id}`,
    order = null;
    var sms_data = await db_Select(select,table_name,whr,order)
    res.send(sms_data)
}


module.exports={agent_list,agent,editAgentdata,edit_save_agent_data,add_agent,total_user,bank_name_sms,sms_url}