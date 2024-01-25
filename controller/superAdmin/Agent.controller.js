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
    whr = `bank_id = '${data.bank_id}'`,
    order = null;
    var sms_data = await db_Select(select,table_name,whr,order)
    res.send(sms_data)
}

const add_sms = async (req, res) => {
  try {
    const schema = Joi.object({
      bank: Joi.required(),
      sms: Joi.required()
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    // console.log(value);
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.context.key] = detail.message;
      });
      return res.json({ error: errors });
    }

    const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const user_data = req.session.user.user_data.msg[0];

    let fields2 = '(bank_id,template)',
      values2 = `('${value.bank}','${value.sms}')`;
    let res_dt2 = await db_Insert("md_sms", fields2, values2, null, 0);
    // console.log("========sms==========", res_dt2);
    res.redirect("/super-admin/sms");
  } catch (error) {
    // console.log(error);
    res.json({
      error: error,
      status: false,
    });
  }
};

const app_url = async (req, res) => {
  var version_data = await db_Select('*','md_app_version',null,null)
  const viewData = {
    title: "About",
    page_path: "/about/app_version",
    data: version_data
};
// console.log(viewData);
res.render('common/layouts/main', viewData)
}


const header_bank_list = async (req, res) => {
  var bank = await db_Select('*','md_bank',null,null);
  const viewData = {
      title: "Adminn",
      page_path: "/header_footer/header_footer",
      data: bank
  };
  res.render('common/layouts/main', viewData)
} 

const add_header_footer = async (req, res) => {
  try {
    const schema = Joi.object({
      bank_id: Joi.required(),
      header_1: Joi.required(),
      header_1_flag: Joi.string(),
      header_2: Joi.required(),
      header_2_flag: Joi.string(),
      header_3: Joi.required(),
      header_3_flag: Joi.string(),
      header_4: Joi.required(),
      header_4_flag: Joi.string(),
      footer_1: Joi.required(),
      footer_1_flag: Joi.string(),
      footer_2: Joi.required(),
      footer_2_flag: Joi.string(),
      footer_3: Joi.required(),
      footer_3_flag: Joi.string(),
      footer_4: Joi.required(),
      footer_4_flag: Joi.string(),
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
      // console.log(value);
      if (error) {
        const errors = {};
        error.details.forEach((detail) => {
          errors[detail.context.key] = detail.message;
        });
        return res.json({ error: errors });
      }

    const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const user_data = req.session.user.user_data.msg[0];
   

    // console.log(value)
    let fields = '(bank_id,header_1,header_1_flag,header_2,header_2_flag,header_3,header_3_flag,header_4,header_4_flag,footer_1,footer_1_flag,footer_2,footer_2_flag,footer_3,footer_3_flag,footer_4,footer_4_flag,created_by,created_dt)',
        values = `('${value.bank_id}','${value.header_1}','${value.header_1_flag=='Y'? 'Y' : 'N'}','${value.header_2}','${value.header_2_flag=='Y'? 'Y' : 'N'}','${value.header_3}','${value.header_3_flag=='Y'? 'Y' : 'N'}','${value.header_4}','${value.header_4_flag=='Y'? 'Y' : 'N'}','${value.footer_1}','${value.footer_1_flag=='Y'? 'Y' : 'N'}','${value.footer_2}','${value.footer_2_flag=='Y'? 'Y' : 'N'}','${value.footer_3}','${value.footer_3_flag=='Y'? 'Y' : 'N'}','${value.footer_4}','${value.footer_4_flag=='Y'? 'Y' : 'N'}','${user_data.id}','${datetime}')`;
      let res_dt = await db_Insert("md_header_footer", fields, values, null, 0);
      // console.log("========header==========", res_dt);
      req.flash('success', 'Saved successful')
      res.redirect("/super-admin/header_footer");
      // res.json(
      //   {
      //     "success": "password change successfully",
      //     "status": true
      
      // })
  } catch (error){
  //  console.log(error);
//  res.json({
//   error: error,
//   status: false,
//   });
req.flash('error', 'Data not saved Successfully')
res.redirect('/super-admin/header_footer')
}
}

const show_header_footer = async (req, res) => {
  try{
    let select = 'a.bank_id,a.header_1_flag,a.header_2_flag,a.header_3_flag,a.header_4_flag,a.footer_1_flag,a.footer_2_flag,a.footer_3_flag,a.footer_4_flag,b.bank_name',
        table_name = 'md_header_footer a, md_bank b',
        whr = `a.bank_id = b.bank_id
               AND a.bank_id = '${req.query.bank_id}'`;
    const resData = await db_Select(select, table_name, whr, null)
    res.json(resData)
  } catch (error) {
    res.json({
      "suc": 0,
      "msg": []
  });
  }
}

const edit_header_footer = async (req, res) => {
  let select = 'a.bank_id,a.header_1,a.header_1_flag,a.header_2,a.header_2_flag,a.header_3,a.header_3_flag,a.header_4,a.header_4_flag,a.footer_1,a.footer_1_flag,a.footer_2,a.footer_2_flag,a.footer_3,a.footer_3_flag,a.footer_4,a.footer_4_flag,b.bank_name',
            table_name = 'md_header_footer a, md_bank b',
            whr = `a.bank_id = b.bank_id
            AND a.bank_id = '${req.query.bank_id}'`;
        const resData = await db_Select(select, table_name, whr, null)
        console.log(resData);
        delete resData.sql
        var viewData = {
            title: "Header_Footer",
            page_path: "/header_footer/edit_Header_Footer",
            data: resData.suc > 0 && resData.msg.length > 0 ? resData.msg[0] : [],
            bank_id : req.query.bank_id
        };
        console.log(viewData);
        res.render('common/layouts/main', viewData)
}

const edit_save_header_footer = async (req, res) => {
  try {
      const schema = Joi.object({
          bank_id: Joi.required(),
          header_1: Joi.required(),
          header_1_flag: Joi.string(),
          header_2: Joi.required(),
          header_2_flag: Joi.string(),
          header_3: Joi.required(),
          header_3_flag: Joi.string(),
          header_4: Joi.required(),
          header_4_flag: Joi.string(),
          footer_1: Joi.required(),
          footer_1_flag: Joi.string(),
          footer_2: Joi.required(),
          footer_2_flag: Joi.string(),
          footer_3: Joi.required(),
          footer_3_flag: Joi.string(),
          footer_4: Joi.required(),
          footer_4_flag: Joi.string(),
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
      



      let fields =  `header_1='${value.header_1}',header_1_flag='${value.header_1_flag=='Y' ? 'Y' : 'N'}',header_2='${value.header_2}',header_2_flag='${value.header_2_flag=='Y' ? 'Y' : 'N'}',header_3='${value.header_3}',header_3_flag='${value.header_3_flag=='Y' ? 'Y' : 'N'}',header_4='${value.header_4}',header_4_flag='${value.header_4_flag=='Y' ? 'Y' : 'N'}',footer_1='${value.footer_1}',footer_1_flag='${value.footer_1_flag=='Y' ? 'Y' : 'N'}',footer_2='${value.footer_2}',footer_2_flag='${value.footer_2_flag=='Y' ? 'Y' : 'N'}',footer_3='${value.footer_3}',footer_3_flag='${value.footer_3_flag=='Y' ? 'Y' : 'N'}',footer_4='${value.footer_4}',footer_4_flag='${value.footer_4_flag=='Y' ? 'Y' : 'N'}',modified_by='${user_data.id}',updated_dt='${datetime}'`,
      where=`bank_id='${value.bank_id}'`;
      let res_dt2 = await db_Insert("md_header_footer", fields, null, where, 1);
      // console.log(res_dt2);
      req.flash('success', 'Updated successful')
      res.redirect('/super-admin/header_footer')
  } catch (error) {
      console.log(error);
      // res.json({
      //     "error": error,
      //     "status": false
      // });
      req.flash('error', 'Data not Updated Successfully')
      res.redirect('/super-admin/header_footer')
  }

}


module.exports={agent_list,agent,editAgentdata,edit_save_agent_data,add_agent,total_user,bank_name_sms,sms_url,add_sms,app_url,header_bank_list, add_header_footer,show_header_footer,edit_header_footer,edit_save_header_footer}