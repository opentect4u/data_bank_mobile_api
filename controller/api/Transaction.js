const Joi = require('joi');
const dateFormat = require('dateformat');
const { db_Insert, db_Select, db_Check } = require('../../model/MasterModule');
const { transactionSms } = require('../../event/SendSMS');

const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
const todaydate = dateFormat(new Date(), "yyyy-mm-dd")

// const datetimef = dateFormat(new Date(), "yyyy/mm/dd HH:MM:ss")



const transaction = async (req, res) => {
    try {
        // console.log(req.body, 'Body');
        const schema = Joi.object({
            // receipt_no: Joi.number().required(),
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            transaction_date: Joi.string().required(),
            // transaction_date: Joi.date().isoDate().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            product_code: Joi.string().required(),
            account_holder_name: Joi.string().required(),
            account_number: Joi.string().required(),
            deposit_amount: Joi.number().precision(2).max(999999999999999.99).required(),
            total_amount: Joi.number().precision(2).max(999999999999999.99).required(),
            total_collection_amount: Joi.number().precision(2).max(999999999999999.99).required(),
            collection_by: Joi.number().required(),
            sec_amt_type: Joi.string().valid('A', 'M').required(),
            pay_mode: Joi.string().valid('O','F').default('F'),
            pay_txn_id: Joi.string().optional().default(null),
            pay_amount: Joi.string().optional().default(null),
            pay_amount_original: Joi.string().optional().default(null),
            currency_code: Joi.string().optional().default(null),
            payment_mode: Joi.string().optional().default(null),
            pay_status: Joi.string().optional().default(null),
            receipt_url: Joi.string().optional().default(null)
            // collected_at: Joi.required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            console.log(error);
            
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
        datetimef = dateFormat(new Date(), "yyyy/mm/dd HH:MM:ss");

        var timestamp = new Date().getTime();
        var fields = 'sl_no',
            whr = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND coll_flag='Y' AND end_flag='N'`;

        let checkedData = await db_Check(fields, "md_agent_trans", whr);

        // =================================================================
        // =================================================================

        var cbalcheck = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND active_flag='Y'`;
        let total_collectlimite = await db_Select("max_amt,allow_collection_days, (max_amt * allow_collection_days) tot_amt", "md_agent", cbalcheck, null);

        // var totalallowamt = total_collectlimite.msg[0].max_amt * total_collectlimite.msg[0].allow_collection_days;

        var totalallowamt = total_collectlimite.msg[0].tot_amt;

        var totalallowamt2 = total_collectlimite.msg[0].max_amt;
        // console.log("======totalallowamt===========", totalallowamt2)
        var cbalcheck5 = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND agent_trans_no IS NULL`

        let total_collectamttt = await db_Select("ifnull(SUM(deposit_amount),0) as deposit_amount", "td_collection", cbalcheck5, null);

        // // console.log(value.sec_amt_type, totalallowamt, (total_collectamttt.msg[0].deposit_amount + value.deposit_amount), (value.sec_amt_type == 'M' && (totalallowamt > (total_collectamttt.msg[0].deposit_amount + value.deposit_amount))), 'LALALALALAAAAAAAAAAAAAA');        

        if (value.sec_amt_type == 'M' && (totalallowamt > (parseFloat(total_collectamttt.msg[0].deposit_amount) + value.deposit_amount))) {
            // console.log("tttttttttttttttttttttttttttttttt")
            if (checkedData.msg > 0) {
                // let select = "ifnull(max(receipt_no),0) + 1 AS rc_no",
                //     where = `bank_id=${value.bank_id} AND transaction_date = '${dateFormat(value.transaction_date, "yyyy-mm-dd")}'`;
                // let resData = await db_Select(select, "td_collection", where, null);
                // const recpt_no = resData.msg[0].rc_no;

                let recpt_no = timestamp;
                let res_dt = {};
                if(value.pay_mode != 'F'){
                    let fields = '(receipt_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number,account_holder_name, deposit_amount,balance_amount, collection_by, collected_at, pay_mode, pay_txn_id, pay_amount, pay_amount_original, currency_code, payment_mode, pay_status, receipt_url)',
                        transData = dateFormat(value.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                        values = `('${recpt_no}','${value.bank_id}','${value.branch_code}','${value.agent_code}','${transData}','${value.account_type}','${value.product_code}','${value.account_number}','${value.account_holder_name}','${value.deposit_amount}','${value.total_amount}','${value.collection_by}','${datetime}', '${value.pay_mode}', '${value.pay_txn_id}', '${value.pay_amount}', '${value.pay_amount_original}', '${value.currency_code}', '${value.payment_mode}', '${value.pay_status}', '${value.receipt_url}')`;
                    res_dt = await db_Insert("td_collection", fields, values, null, 0);
                }else{
                    let fields = '(receipt_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number,account_holder_name, deposit_amount,balance_amount, collection_by, collected_at)',
                        transData = dateFormat(value.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                        values = `('${recpt_no}','${value.bank_id}','${value.branch_code}','${value.agent_code}','${transData}','${value.account_type}','${value.product_code}','${value.account_number}','${value.account_holder_name}','${value.deposit_amount}','${value.total_amount}','${value.collection_by}','${datetime}')`;
                    res_dt = await db_Insert("td_collection", fields, values, null, 0);
                }

                // let fields = '(receipt_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number,account_holder_name, deposit_amount,balance_amount, collection_by, collected_at)',
                //     transData = dateFormat(value.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                //     values = `('${recpt_no}','${value.bank_id}','${value.branch_code}','${value.agent_code}','${transData}','${value.account_type}','${value.product_code}','${value.account_number}','${value.account_holder_name}','${value.deposit_amount}','${value.total_amount}','${value.collection_by}','${datetime}')`;
                // let res_dt = await db_Insert("td_collection", fields, values, null, 0);


                if (res_dt.suc == 1) {
                    let setdata = `current_balance=${value.total_amount}`,
                        upwhere5 = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number='${value.account_number}' AND product_code = '${value.product_code}'`;
                    await db_Insert("td_account_dtls", setdata, null, upwhere5, 1);
                    let select5 = "mobile_no",
                        where5 = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number='${value.account_number}' `;
                    let resData5 = await db_Select(select5, "td_account_dtls", where5, null);
                    var transtype = (value.account_type == 'D') ? "daily deposit" : (value.account_type == 'L') ? "loan" : "";
                    var sms_status = false;
                    //send sms
                    if (resData5.msg[0]) {
                        let mobile = resData5.msg[0].mobile_no
                        await transactionSms(mobile, value.deposit_amount, value.account_holder_name, value.total_amount, recpt_no, datetimef, transtype, value.account_number, value.bank_id)
                            .then((result) => {
                                // console.log("==========---------========", result.data);
                                sms_status = true;
                            })
                            .catch((error) => {
                                sms_status = false;
                                console.error("================================", error);
                            });
                    }

                    res.json({
                        "success": res_dt,
                        "sms_status": sms_status,
                        "receipt_no": recpt_no,
                        "status": true
                    });

                } else {
                    res.json({
                        "error": "not found error ",
                        "status": false
                    });
                }


            } else {
                res.json({
                    "error": "collection ending",
                    "status": false
                });
            }
        } else if (value.sec_amt_type == 'A' && (totalallowamt2 > (parseFloat(total_collectamttt.msg[0].deposit_amount) + value.deposit_amount))) {
            // =================================================================
            // =================================================================
            if (checkedData.msg > 0) {
                // let select = "receipt_no",
                //where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND transaction_date='${todaydate}' `,
                //     where = `bank_id=${value.bank_id} AND transaction_date = '${todaydate}' `,
                //     orderB = `ORDER BY receipt_no DESC `;
                // let resData = await db_Select(select, "td_collection", where, orderB);

                // const recpt_no = (resData.msg[0]) ? ( resData.msg[0].receipt_no + 1):(value.bank_id.toString() + value.branch_code.toString()  + '1');

                //         SELECT ifnull(max(receipt_no),0) + 1
                // FROM td_collection
                // where bank_id = 1
                // and   transaction_date = '2023-09-18

                // const recpt_no = (resData.msg[0]) ? (parseInt(resData.msg[0].receipt_no) + 1) : (value.bank_id.toString() + '1');


             /*   let select = "ifnull(max(receipt_no),0) + 1 AS rc_no",
                    where = `bank_id=${value.bank_id} AND transaction_date = '${dateFormat(value.transaction_date, "yyyy-mm-dd")}'`;
                // orderB = `ORDER BY receipt_no DESC `;
                let resData = await db_Select(select, "td_collection", where, null);

                // console.log("===========rc no ===============", resData)

                const recpt_no = resData.msg[0].rc_no;*/
                let recpt_no = timestamp;
                // console.log("===========rc no ===============", recpt_no)
                let fields = '(receipt_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number,account_holder_name, deposit_amount,balance_amount, collection_by, collected_at)',
                    transData = dateFormat(value.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                    values = `('${recpt_no}','${value.bank_id}','${value.branch_code}','${value.agent_code}','${transData}','${value.account_type}','${value.product_code}','${value.account_number}','${value.account_holder_name}','${value.deposit_amount}','${value.total_amount}','${value.collection_by}','${datetime}')`;
                let res_dt = await db_Insert("td_collection", fields, values, null, 0);


                if (res_dt.suc == 1) {
                    //let setdata = `current_balance=${value.total_amount}`,
                    let setdata = `current_balance=current_balance+${value.deposit_amount}`,
                        upwhere5 = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number='${value.account_number}' AND product_code = '${value.product_code}'`;
                    let upresData5 = await db_Insert("td_account_dtls", setdata, null, upwhere5, 1);

                    let select5 = "mobile_no",
                        where5 = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number='${value.account_number}' `;
                    let resData5 = await db_Select(select5, "td_account_dtls", where5, null);
                    // console.log("===========mobile==============", resData5);
                    var transtype = (value.account_type == 'D') ? "daily deposit" : (value.account_type == 'L') ? "loan" : "";

                    var sms_status = false;

                    //send sms

                    if (resData5.msg[0]) {
                        let mobile = resData5.msg[0].mobile_no

                        await transactionSms(mobile, value.deposit_amount, value.account_holder_name, value.total_amount, recpt_no, datetimef, transtype, value.account_number, value.bank_id)
                            .then((result) => {
                                // console.log("==========---------========", result.data);
                                sms_status = true;
                            })
                            .catch((error) => {
                                sms_status = false;
                                console.error("================================", error);
                            });
                    }
                    res.json({
                        "success": res_dt,
                        "sms_status": sms_status,
                        "receipt_no": recpt_no,
                        "status": true
                    });
                }else{

                    res.json({
                        "error": "not found error ",
                        "status": false
                    });

                }

                

            } else {
                res.json({
                    "error": "collection ending",
                    "status": false
                });
            }

        } else {
            res.json({
                "error": "Collection limit ending",
                "status": false
            });
        }



    } catch (error) {
        console.log(error);
        
        res.json({
            "error": error,
            "status": false
        });
    }
}



const end_collection = async (req, res) => {
    try {
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.required(),
            password: Joi.string().required(),
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            coll_flag: Joi.string().valid('Y', 'N').required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        let wheree = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND coll_flag='Y' AND end_flag='N' AND agent_trans_no IS NULL`;
        let lastagent_trans = await db_Select("sl_no", "md_agent_trans", wheree, null);
        // let transDate = dateFormat(value.transaction_date, "yyyymmdd")

        if(lastagent_trans.suc > 0 && lastagent_trans.msg.length > 0){
            // let transDate = ((value.agent_code).toString() + (lastagent_trans.msg[0].sl_no).toString()).toString()
            let transDate = `'${value.agent_code}${lastagent_trans.msg[0].sl_no}'`
            let slnoEndTrans = lastagent_trans.msg[0].sl_no;
    
            let select = "count(*) total_collection",
                where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND agent_trans_no IS NULL`;
            let resData = await db_Select(select, "td_collection", where, null);
            if (resData.msg[0].total_collection > 0) {
                let dbvalers = `agent_trans_no='${transDate}'`,
                    dbwhere = `bank_id='${value.bank_id}'AND branch_code='${value.branch_code}'AND agent_code='${value.agent_code}' AND agent_trans_no IS NULL`;
                let update_res = await db_Insert("td_collection", dbvalers, null, dbwhere, 1);
                if (update_res.suc > 0) {
                    let fields = `agent_trans_no ='${transDate}', coll_flag='N', received_date='${dateFormat(new Date(), "yyyy-mm-dd")}', end_flag='Y'`,
                        wherre = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND coll_flag='Y' AND end_flag='N' AND agent_trans_no IS NULL`;
                    let res_dt = await db_Insert("md_agent_trans", fields, null, wherre, 1);
                    res.json({
                        "success": res_dt,
                        "status": true
                    });
                } else {
                    res.json({
                        "error": "Error while updating agent collection.",
                        "status": false
                    });
                }
            } else {
                let fields = `coll_flag='N', received_date='${dateFormat(new Date(), "yyyy-mm-dd")}', end_flag='Y'`,
                wherre = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND coll_flag='Y' AND end_flag='N' AND agent_trans_no IS NULL`;
                let res_dt = await db_Insert("md_agent_trans", fields, null, wherre, 1);
                res.json({
                    "success": res_dt,
                    "status": true
                });
            }
        }else{
            res.json({
                "error": "No data found in agent transaction.",
                "status": false
            });
        }

    } catch (error) {
        res.json({
            "error": "Something went wrong. Please try again later.",
            "status": false,
        });
    }
}



const now_date = async (req, res) => {
    try {
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        res.json({
            "now_date": datetime,
            "status": true
        });
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}


const collection_checked = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var selectCollectionData = "*"
        whrCollectionDAta = `bank_id='${value.bank_id}' AND branch_code='${value.branch_code}'AND agent_code ='${value.agent_code}'`,
            order_by = "ORDER BY sl_no DESC LIMIT 1";
        let total_collection = await db_Select(selectCollectionData, "md_agent_trans", whrCollectionDAta, order_by);
        delete total_collection.sql;
        res.json({
            "data": total_collection,
            "status": true
        });


    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}

const total_collection = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var selectCollectionData = "ifnull(SUM(deposit_amount),0) as deposit_amount"
        whrCollectionDAta = `bank_id='${value.bank_id}' AND branch_code='${value.branch_code}'AND agent_code ='${value.agent_code}' AND agent_trans_no IS NULL AND download_flag = 'N'`;
        let total_collection = await db_Select(selectCollectionData, "td_collection", whrCollectionDAta, null);
        delete total_collection.sql;
        res.json({
            "success": total_collection,
            "status": true
        });

    } catch (error) {
        res.json({
            "Error": error,
            "status": true
        });
    }
}

module.exports = { transaction, end_collection, now_date, collection_checked, total_collection }