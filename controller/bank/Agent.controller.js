const Joi = require('joi');
const bcrypt = require('bcrypt');
const dateFormat = require('dateformat');
const { db_Insert, db_Select, db_Delete } = require('../../model/MasterModule');
const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
//login View
const agent = async (req, res) => {
    try {
        const user_data = req.session.user.user_data.msg[0];
        if (req.params.branch_id) {
            let select = 'c.branch_name,a.id, a.user_id,a.active_flag,a.device_id,a.device_sl_no,b.agent_name,b.agent_address,b.phone_no,b.email_id,b.max_amt, a.branch_code',
                table_name = 'md_user as a, md_agent as b,md_branch AS c',
                whr = `a.user_id=b.agent_code AND a.branch_code=c.branch_code AND a.bank_id=c.bank_id AND a.bank_id='${user_data.bank_id}' AND b.bank_id='${user_data.bank_id}' AND b.branch_code='${req.params.branch_id}' AND a.user_type='O'`;
            var resData = await db_Select(select, table_name, whr, null)
        } else {
            let select = 'c.branch_name,a.id, a.user_id,a.active_flag,a.device_id,a.device_sl_no,b.agent_name,b.agent_address,b.phone_no,b.email_id,b.max_amt, a.branch_code',
                table_name = 'md_user as a, md_agent as b,md_branch AS c',
                whr = `a.user_id=b.agent_code AND a.branch_code=c.branch_code AND a.bank_id=c.bank_id AND a.bank_id='${user_data.bank_id}' AND b.bank_id='${user_data.bank_id}' AND a.user_type='O'`;
            var resData = await db_Select(select, table_name, whr, null)
        }
        var whrbr = `bank_id='${user_data.bank_id}'`
        var resDataBranch = await db_Select('branch_code,branch_name', "md_branch", whrbr, null)
        var viewData = {
            title: "Agent",
            page_path: "/agent/viewAgent_bank",
            data: resData,
            resDataBranch: resDataBranch
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
// const addAgent = async (req, res) => {
//     try {
//         const schema = Joi.object({
//             user_id: Joi.required(),
//             name: Joi.string().required(),
//             email: Joi.string().required(),
//             mobile: Joi.string().required(),
//             max_amt: Joi.number().required(),
//             allow_collection_days: Joi.number().required(),
//             password: Joi.string().required(),
//             confirmPassword: Joi.string().required().valid(Joi.ref('password')),
//             device_id: Joi.required(),

//             // device_sl_no: Joi.required(),
//             // adress: Joi.string().required(),
           
//             // profile_pic: Joi.required(),
//         });
//         const { error, value } = schema.validate(req.body, { abortEarly: false });
//         if (error) {
//             const errors = {};
//             error.details.forEach(detail => {
//                 errors[detail.context.key] = detail.message;
//             });
//             return res.json({ error: errors });
//         }
//         let pss = value.password
//         let enc_pss = bcrypt.hashSync(pss, 10)
//         const user_data = req.session.user.user_data.msg[0];
//         let fields = '(bank_id, branch_code, user_type,password, device_id, user_id, active_flag, created_by, created_at, delete_flag)',
//             values = `('${user_data.bank_id}','${user_data.branch_code}','O','${enc_pss}','${value.device_id}','${value.user_id}','N','${user_data.id}','${datetime}','N')`;
//         let res_dt = await db_Insert("md_user", fields, values, null, 0);


//         let fields2 = '(bank_id, branch_code, agent_code,agent_name, phone_no, email_id,max_amt,allow_collection_days,created_by,created_at,delete_flag)',

//             values2 = `('${user_data.bank_id}','${user_data.branch_code}','${value.user_id}','${value.name}','${value.mobile}','${value.email}','${value.max_amt}','${value.allow_collection_days}','${user_data.id}','${datetime}','N')`;

//         let res_dt2 = await db_Insert("md_agent", fields2, values2, null, 0);

//         res.redirect('/admin/agent')
//     } catch (error) {
//         res.json({
//             "error": error,
//             "status": false
//         });
//     }
// }
const editAgent = async (req, res) => {
    try {
        const user_data = req.session.user.user_data.msg[0];
        let select = 'c.branch_name,b.allow_collection_days,a.id, a.user_id,a.active_flag,a.device_id,a.device_sl_no,b.agent_name,b.agent_address,b.phone_no,b.email_id,b.max_amt,c.branch_code',
            table_name = 'md_user as a, md_agent as b,md_branch as c',
            whr = `a.user_id=b.agent_code AND c.bank_id=a.bank_id AND c.branch_code=a.branch_code AND a.bank_id='${user_data.bank_id}' AND b.bank_id='${user_data.bank_id}' AND a.user_type='O' AND a.id=${req.params['agent_id']}`;
        const resData = await db_Select(select, table_name, whr, null)
        console.log("===///=======",resData)
        delete resData.sql
        var viewData = {
            title: "Agent",
            page_path: "/agent/editViewAgentBank",
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
            allow_collection_days: Joi.number().required(),
            device_id: Joi.required(),
            branch_code: Joi.string().required(),
            agent_active: Joi.string()

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
        const user_data = req.session.user.user_data.msg[0];

        let active_flag = (value.agent_active) ? 'Y' : 'N';
        //console.log('===', (value.agent_active) ? 'Y' : 'N')

        if (active_flag == 'Y') {

            let whcheck = `bank_id='${user_data.bank_id}'`;
            let resdata = await db_Select('IF(SUM(no_of_users)>0, no_of_users, 0) as no_of_users', 'md_subscription', whcheck, null);
            //console.log('==========////========', resdata.msg[0].no_of_users)
            let whcheck_agent = `bank_id='${user_data.bank_id}' AND active_flag='Y' and user_type='O'`;
            let resdata_agent = await db_Select('ifnull(count(*),0) as total_agent', 'md_user', whcheck_agent, null);
            //console.log('********++++++**********', resdata_agent.msg[0].total_agent)
            //if (resdata_agent.msg[0].total_agent < resdata.msg[0].no_of_users) {

                let fields = `device_id='${value.device_id}',active_flag='Y',modified_by='${user_data.id}',updated_at='${datetime}'`,
                    whr1 = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}'AND user_id='${value.user_id}' AND id='${req.params['agent_id']}'`;
                let res_dt = await db_Insert("md_user", fields, null, whr1, 1);

                let fields2 = `agent_name='${value.name}', phone_no='${value.mobile}', email_id='${value.email}',max_amt='${value.max_amt}',allow_collection_days='${value.allow_collection_days}',modified_by='${user_data.id}',updated_at='${datetime}'`,
                    whr = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}'AND agent_code='${value.user_id}'`;
                let res_dt2 = await db_Insert("md_agent", fields2, null, whr, 1);
				//res.send({res_dt2,res_dt});
                req.flash('success', 'Agent updated successfully')
                res.redirect('/bank/agent')
            // } else {
            //    req.flash('error', 'Agent limit is over')
            //   	res.redirect('/bank/agent')
            // }
        } 
		
		// else {
        //     let fields = `device_id='${value.device_id}',modified_by='${user_data.id}',updated_at='${datetime}'`,
        //         whr1 = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}'AND user_id='${value.user_id}' AND id='${req.params['agent_id']}'`;
        //     let res_dt = await db_Insert("md_user", fields, null, whr1, 1);



        //     let fields2 = `agent_name='${value.name}', phone_no='${value.mobile}', email_id='${value.email}',max_amt='${value.max_amt}',allow_collection_days='${value.allow_collection_days}',modified_by='${user_data.id}',updated_at='${datetime}'`,
        //         whr = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}'AND agent_code='${value.user_id}'`;
        //     let res_dt2 = await db_Insert("md_agent", fields2, null, whr, 1);
        //     req.flash('warning', 'Agent updated successfully and Agent active is not possible')
        //     // req.flash('success', 'Agent updated successfully')
        //     res.redirect('/bank/agent')
        // }

        else {
            let fields = `device_id='${value.device_id}',active_flag='N',modified_by='${user_data.id}',updated_at='${datetime}'`,
                whr1 = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}'AND user_id='${value.user_id}' AND id='${req.params['agent_id']}'`;
            let res_dt = await db_Insert("md_user", fields, null, whr1, 1);

            let fields2 = `agent_name='${value.name}', phone_no='${value.mobile}', email_id='${value.email}',max_amt='${value.max_amt}',allow_collection_days='${value.allow_collection_days}',modified_by='${user_data.id}',updated_at='${datetime}'`,
                whr = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}'AND agent_code='${value.user_id}'`;
            let res_dt2 = await db_Insert("md_agent", fields2, null, whr, 1);
            req.flash('success', 'Agent updated successfully')
            res.redirect('/bank/agent')
        }
		
		 // res.redirect('/bank/agent')

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
const check_user_collection = async (req, res) => {
    try {
        const schema = Joi.object({
            agent_code: Joi.required()
        });
        const { error, value } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        var res_msg = '', allow_flag = 0;
        //db connection
        var fields = "count(*) tot_row",
            table_name = "md_agent_trans",
            where = `agent_code = '${value.agent_code}' AND coll_flag = 'Y'`,
            order = null;
        let tableDate = await db_Select(fields, table_name, where, order);

        if(tableDate.suc > 0){
            if(tableDate.msg[0].tot_row > 0){
                res_msg = 'Active collection'
                allow_flag = 0
            }else{
                var fields = "count(*) tot_row",
                    table_name = "td_collection",
                    where = `agent_code = '${value.agent_code}' AND agent_trans_no is null`,
                    order = null;
                let chk_dt = await db_Select(fields, table_name, where, order);
                if(chk_dt.suc > 0){
                    if(chk_dt.msg[0].tot_row > 0){
                        res_msg = 'All data not downloaded as PCRX'
                        allow_flag = 0
                    }else{
                        res_msg = 'All data downloaded'
                        allow_flag = 1
                    }
                }else{
                    res_msg = 'Error occurs, fetching agent collection'
                    allow_flag = 0
                }
            }
        }else{
            res_msg = 'Error occurs, fetching agent transaction'
            allow_flag = 0
        }

        res.send({suc: 1, msg: allow_flag, comp_msg: res_msg});
        
    } catch (error) {
        res.send({suc: 0, msg: JSON.stringify(error)});
    }
}

const delete_agent = async (req, res) => {
    const schema = Joi.object({
        agent_code: Joi.required(),
        branch_code: Joi.required()
    });
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    if (error) {
        const errors = {};
        error.details.forEach(detail => {
            errors[detail.context.key] = detail.message;
        });
        return res.json({ error: errors });
    }
    var user_data = req.session.user.user_data.msg[0],
    res_dt = {};

    let agentdelwhr = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}'  AND user_id='${value.agent_code}'`;

    var agentResDt = await db_Delete("md_user", agentdelwhr)

    if(agentResDt.suc > 0){
        let agentdelwhr = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}'`;
    
        var agentDel = await db_Delete("md_agent", agentdelwhr)

        let trnsdelwhr = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}'`;
    
        var trnsDel = await db_Delete("md_agent_trans", trnsdelwhr)

        let coldelwhr = `bank_id='${user_data.bank_id}' AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}'`;
    
        var colDel = await db_Delete("td_collection", coldelwhr)
        res_dt = colDel
        res.redirect('/bank/agent')
    }else{
        res_dt = agentResDt
        res.redirect('/bank/agent')
    }
}

module.exports = { agent, editAgent, edit_save_agent,checkedUnicUser, check_user_collection, delete_agent }
// module.exports = { agent, editAgent, edit_save_agent,checkedUnicUser }
// module.exports = { agent, addAgent, editAgent, edit_save_agent,checkedUnicUser }