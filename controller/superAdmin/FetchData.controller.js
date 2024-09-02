const Joi = require("joi");
const {db_Select, db_db_Select_Sqery, db_Insert } = require("../../model/MasterModule");
const dateFormat = require("dateformat");
const bcrypt = require("bcrypt");
const { getBankMaxUser, getTotalAgent } = require("../admin/Agent.controller");


const fetch_bank_info=async (req,res)=>{
    // try {
        const schema = Joi.object({
            bank_id: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
	
        var sql=`select branch_name,sum(active) as active ,sum(inactive) as inactive from (SELECT 	a.branch_name,count(b.user_id)active,0 inactive from    md_branch a,md_user b where   a.bank_id = b.bank_id and     a.branch_code = b.branch_code and     a.bank_id = ${value.bank_id} and     b.user_type = 'O' and     b.active_flag = 'Y' group by a.branch_name UNION SELECT 	a.branch_name,0 active,count(b.user_id)inactive from    md_branch a,md_user b where   a.bank_id = b.bank_id and     a.branch_code = b.branch_code and     a.bank_id = ${value.bank_id} and     b.user_type = 'O' and     b.active_flag = 'N' group by a.branch_name) a group by branch_name`

        var branchData= await db_db_Select_Sqery(sql);
            var whr=`bank_id=${value.bank_id}`
        var md_subscription = await db_Select('no_of_users', "md_subscription", whr, null);
        delete branchData.sql
	
        res.json({
            "SUCCESS": {branchData,md_subscription},
            "status": true
        });

        
    // } catch (error) {
    //     res.json({
    //         "ERROR": error,
    //         "status": false
    //     });
    // }
}

const get_branch_name=async (req,res)=>{
    // try {
        const schema = Joi.object({
            bank_id: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
	
        // var sql=`select a.branch_id,a.branch_code,a.branch_name,a.contact_person,a.phone_no from md_branch a
        //          where a.bank_id = ${value.bank_id}`
        var sql=`select branch_id,branch_code,branch_name,contact_person,phone_no from md_branch 
                 where bank_id = ${value.bank_id}`
        
        var max_bank_user = await getBankMaxUser(value.bank_id),
        tot_user = await getTotalAgent(value.bank_id, 'Y');

        var branchData= await db_db_Select_Sqery(sql);
        branchData['max_user'] = max_bank_user.suc > 0 ? max_bank_user.msg[0].max_user : 0
        branchData['active_user'] = tot_user.suc > 0 ? tot_user.msg[0].tot_agent : 0
        res.json({
            "SUCCESS": {branchData},
            "status": true
        });
}

const bank_name = async (req, res) => {
    const user_data = req.session.user.user_data.msg[0];
    // // console.log(user_data)
    var bank = await db_Select('*','md_bank',null,null);
    const viewData = {
        title: "Adminn",
        page_path: "/summary/summary",
        data: bank
    };
    res.render('common/layouts/main', viewData)
}

const password = async (req, res) => {
      const user_data = req.session.user.user_data.msg[0];
      // console.log(user_data,"123456");
      const datetime = dateFormat(new Date(), "yyyy-mm-dd");
      
      var data = req.body,result;
    //   // console.log(data,"1234");

      var select = "id,password",
      table_name = "md_user",
      whr = `id='${user_data.id}'`;
      var res_dt = await db_Select(select,table_name,whr,null)
    //   // console.log(res_dt,"1234");

      if(res_dt.suc > 0) {
        if(res_dt.msg.length > 0) {
          if (await bcrypt.compare(data.old_pwd, res_dt.msg[0].password)) {
            var pass = bcrypt.hashSync(data.new_pwd, 10);
            var table_name = "md_user",
            fields = `password = '${pass}', modified_by='${user_data.id}', updated_at='${datetime}'`,
            where2 = `id = '${user_data.id}'`,
            flag = 1;
            var forget_pass = await db_Insert(table_name,fields,null,where2,flag)
            result = forget_pass
            // req.flash("success","Password updated successfully")
            res.redirect("/admin/logout");
          }else {
            // result = {
            //   suc: 0,
            //   msg: "Please provide your correct old password"
            // };
            res.redirect("/super-admin/summary");
          }
        }else {
            // result = { suc: 0, msg: "No data found" };
            res.redirect("/super-admin/summary");
          }
      }else {
        // result = { suc: 0, msg: "No data found"};
        res.redirect("/super-admin/summary");
      }
    //  res.send(result)
    //  req.flash("success","Password updated successfully")
    //  res.redirect("/admin/login");
    }



module.exports={fetch_bank_info,get_branch_name, bank_name,password}