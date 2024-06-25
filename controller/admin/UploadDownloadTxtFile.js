const { db_Select, db_Insert, db_Delete, createStrWithZero } = require("../../model/MasterModule");
const dateFormat = require('dateformat');
const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
const stream = require('stream');
const nowdate = dateFormat(new Date() - 1, "yyyy-mm-dd")



const { parse, format } = require('date-fns');
const Joi = require("joi");
const { F_Select, F_Insert, F_Delete, F_insert_bulk_data } = require("../../model/OrcModel");
const { CLIENT_RENEG_LIMIT } = require("tls");

const dtFmtInUpld = (inputDate) => {
    var parsedDate = parse(inputDate, 'dd.MM.yy', new Date());
    return format(parsedDate, 'yyyy-MM-dd');
    var inpDt = '29.08.23'
    console.log(Date.parse(inpDt.replace('.', '-')));
    return dateFormat(Date.parse(inpDt.replace('.', '-')), 'yyyy-mm-dd');
}

const strDAta = (inputStr) => {
    // console.log(inputStr)
    try {
        return inputStr.replace(/^\s*/, '').trim()
    } catch (error) {
        return " "
    }

}

const upload_pctx = async (req, res) => {
    const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `a.user_id=b.agent_code AND a.bank_id=b.bank_id AND a.branch_code=b.branch_code AND a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}'  AND a.active_flag='Y'AND a.user_type='O'`,
        selectData = "a.user_id,b.agent_name";
    let dbuser_data = await db_Select(selectData, "md_user a, md_agent b", whrDAta, null);

    var template = (user_data.data_trf == 'A') ? "/upload_file/upload_data_api" : "/upload_file/upload_pctx";

    // var template="/upload_file/upload_pctx";
    // var template="/upload_file/upload_data_api";
    var viewData = {
        title: "Upload || PCTX",
        page_path: template,
        data: dbuser_data.msg
    };
    res.render('common/layouts/main', viewData)
}


const create_agent_trans = async (req, res) => {
    try {
        const schema = Joi.object({
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
        const user_data = req.session.user.user_data.msg[0];
        var fields = '(bank_id, branch_code, agent_code, coll_flag, send_date, end_flag)',

            values = `('${user_data.bank_id}','${user_data.branch_code}','${value.agent_code}','Y','${dateFormat(new Date(), "yyyy-mm-dd")}','N')`;
        var res_dt = await db_Insert("md_agent_trans", fields, values, null, 0);

        // var dt = new Date()
        // dt.setDate(dt.getDate() -1)

        res.json({
            "SUCCESS": res_dt,
            "status": true
        });
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": true
        });
    }
}




const update_agent_amount = async (req, res) => {
    try {
        const schema = Joi.object({
            account_no: Joi.string().required(),
            agent_id: Joi.string().required()
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

        //     let whr = `bank_id=${user_data.bank_id} and branch_code='${user_data.branch_code}' agent_code='${value.agent_code}'`;   
        //    var resdata= await db_Select('*', 'md_agent', whr, null);
        //    console.log("**********************", resdata)

        //db connection
        let fields = "clr_bal",
            table_name = "TM_DEPOSIT",
            where = `acc_type_cd = 1 AND acc_num = '${value.account_no}'`,
            order = null,
            flag = 1;
        let tableDate = await F_Select(user_data.bank_id, fields, table_name, where, order, flag, full_query = null);

        //console.log("**********************", tableDate)


        if (tableDate.msg[0].CLR_BAL) {
            console.log("**********************", tableDate.msg[0].CLR_BAL)

            let whr = `bank_id=${user_data.bank_id} and branch_code='${user_data.branch_code}' and agent_code='${value.agent_id}'`,
                fields = `max_amt='${tableDate.msg[0].CLR_BAL}'`;


            var resdata = await db_Insert('md_agent', fields, null, whr, 1);
            console.log("**********************", resdata)


        }



        res.json({
            "status": true
        });
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": true
        });
    }
}

const upload_pctx_file_data = async (req, res) => {
    try {
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const selectAgentId = req.body.agent_id;
        const user_data = req.session.user.user_data.msg[0];
        const firstRow = req.body.firstRow.split(',');
        const file_AGENT_CODE = firstRow[6]
        var er
        const chk_arr = req.body.batch[0].split(',');
        // console.log("========FIRST ROW==========", req.body.agent_id)
        // for (let i = 0; i < req.body.batch.length; i++) {
        // console.log(req.body.batch.length);
        if(user_data.branch_code == chk_arr[0].replace(/^\s*/, '').trim()){
            if(parseInt(selectAgentId) == parseInt(file_AGENT_CODE)){
                for (let dt of req.body.batch) {
                    // var input = req.body.batch[i];
                    var input = dt;
                    const valuesArray = input.split(',');
                    // console.log("************************",valuesArray.length)
                    if (valuesArray.length == 9) {
                        // console.log(JSON.stringify(valuesArray));
                        // for (let i = 0; i < valuesArray.length; i++) {
                        //     valuesArray[i].replace(/^\s*/, '').trim();
                        // }
                        var fields = '(bank_id, branch_code, agent_code, upload_dt, deposit_loan_flag, acc_type, product_code, account_number, customer_name, opening_date, current_balance, uploaded_by, upload_at)',
        
                            // values = `('${user_data.bank_id}','${valuesArray[0].replace(/^\s*/, '').trim()}','${file_AGENT_CODE}','${datetime}','${(valuesArray[1] == '+') ? 'D' : (valuesArray[1] == '-') ? 'L' : 'R'}','D','${valuesArray[2]}','${strDAta(valuesArray[3])}','${strDAta(valuesArray[5])}', '${dtFmtInUpld(valuesArray[7])}','${valuesArray[6]}','${user_data.id}','${datetime}')`;
        
                            values = `('${user_data.bank_id}','${valuesArray[0].replace(/^\s*/, '').trim()}','${selectAgentId}','${datetime}','${valuesArray[1] == '+' ? 'D' : 'L'}','${(valuesArray[1] == '+') ? (valuesArray[2].trim().split(' ').join('') != 'RD' ? 'D' : 'R') : 'L'}','${valuesArray[2].trim().split(' ').join('')}','${strDAta(valuesArray[3])}','${strDAta(valuesArray[5])}', '${dtFmtInUpld(valuesArray[7])}','${valuesArray[6]}','${user_data.id}','${datetime}')`;
                        res_dt
                        try {
                            var res_dt = await db_Insert("td_account_dtls", fields, values, null, 0);
                            er = res_dt
                        } catch (error) {
                            er = error
                        }
                    }
                }
                if (req.body.batch.length > 0) {
                    res.json({
                        "success": req.body.batch.length,
                        "status": true
                    });
                } else {
                    res.json({
                        "ERROR": req.body.batch.length,
                        "status": true
                    });
                }
            }else{
                res.send({
                    "ERROR": 'Selected Agent Code and PCTX Agent code does not match.',
                    "status": false
                });
            }
        }else{
            res.send({
                "ERROR": 'Selected Branch Code and PCTX Branch code does not match.',
                "status": false
            });
        }
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
}

const download_pcrx = async (req, res) => {
    const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'  AND active_flag='Y'AND user_type='O'`,
        selectData = "user_id";
    let dbuser_data = await db_Select(selectData, "md_user", whrDAta, null);


    // upload_data

    var template = (user_data.data_trf == 'A') ? "upload_file/pushserver_pcrx" : "upload_file/download_pcrx";

    var viewData = {
        title: "DOWNLOAD || PCRX",
        page_path: template,
        data: dbuser_data.msg
    };
    res.render('common/layouts/main', viewData)
}

const download_pcrx_file = async (req, res) => {
    try {
        const agent_code = req.query.agent_code;
        const fDate = req.query.fDate;
        const tDate = req.query.tDate;
        const format = req.query.format;
        const transitionNumber = req.query.transaction_number;
        const user_data = req.session.user.user_data.msg[0];
        // console.log(user_data);
        const currTimeStamp = new Date().getTime();
        var text = '';
        switch (user_data.data_version) { // S-> Coching; C-> Dhanbad; N-> Normal;
            case "S":
                text = await coching_version_download(
                    user_data,
                    agent_code,
                    transitionNumber
                    );
                    break;
            case "C":
                // console.log(user_data.data_version, 'dataversion');
                text = await dhanbad_version_download(
                user_data,
                agent_code,
                transitionNumber
                );
                break;
            case "N":
                text = await normal_version_download(
                user_data,
                agent_code,
                transitionNumber
                );
                break;

            default:
                break;
        }

        // console.log(text, 'TEXT IS HERE');
        // res.setHeader('Content-Disposition', 'attachment; filename="PCRX' + transitionNumber + '.txt"');
        if(format != 'C'){
            res.setHeader('Content-Disposition', 'attachment; filename="PCRX' + agent_code + currTimeStamp + '.txt"');
            res.setHeader('Content-Type', 'text/plain');
        }else{
            res.setHeader('Content-Disposition', 'attachment; filename="PCRX' + agent_code + currTimeStamp + '.csv"');
            res.setHeader('Content-Type', 'text/csv');
        }
        const readable = new stream.Readable();
        readable._read = () => { };
        readable.push(text);
        readable.push(null);
        readable.pipe(res);
    } catch (error) {
        res.redirect('/admin/download_pcrx');
    }
}

const coching_version_download = (user_data, agent_code, transitionNumber) => {
    return new Promise(async (resolve, reject) => {
        var select_q = "LPAD(UPPER(branch_code), 3, '0') as branch_code,RPAD(UPPER(product_code), 5, ' ') as product_code,RPAD(account_number, 19, ' ') as account_number,RPAD(UPPER(account_holder_name), 20, ' ') as name,LPAD(deposit_amount, 10, '0') as deposit_amount, DATE_FORMAT(transaction_date, '%d.%m.%y') as transaction_date, DATE_FORMAT(transaction_date, '%H.%i.%s') as transaction_time,RIGHT(receipt_no, 5) as receipt_no";
        var whr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}'  AND agent_trans_no='${transitionNumber}' AND agent_trans_no IS NOT NULL`;
        
        let res_dt = await db_Select(select_q, "td_collection", whr, null);
        // console.log("=====================", res_dt)
        
        const formattedDate = dateFormat(new Date(), "dd.mm.yy"),
        currTime = dateFormat(new Date(), "HH.MM.ss")
        
        let formattedData = '', tot_coll_amt = 0, tot_coll = 1, 
        agent_code_final = await createStrWithZero(10, agent_code.toString(), '0', 'P');

        if(res_dt.suc > 0){
            for(let item of res_dt.msg){
                const {
                    branch_code,
                    product_code,
                    account_number,
                    name,
                    deposit_amount,
                    transaction_date,
                    transaction_time,
                    receipt_no
                } = item;
                const formattedLine = `${branch_code},${product_code},${account_number},${name},${deposit_amount},${transaction_date},${receipt_no}`;
                formattedData += formattedLine + "\n";
                tot_coll_amt += parseFloat(deposit_amount)
                tot_coll++
            }
        }

        let tot_col_amt_final = await createStrWithZero(19, tot_coll_amt.toString(), '0', 'P'),
        tot_col_final = await createStrWithZero(20, tot_coll.toString(), '0', 'P');
        let col_header = `000,12345,${tot_col_amt_final},${tot_col_final},${agent_code_final},${formattedDate},12345`

        formattedData = col_header + '\n' + formattedData

        const text = formattedData + "";
        resolve(text)
    })
}

const dhanbad_version_download = (user_data, agent_code, transitionNumber) => {
    return new Promise(async (resolve, reject) => {
        try{
            var select_q = "LPAD(UPPER(branch_code), 3, '0') as branch_code,RPAD(UPPER(product_code), 5, ' ') as product_code,LPAD(account_number, 6, '0') as account_number,RPAD(UPPER(account_holder_name), 16, ' ') as name,LPAD(ROUND(deposit_amount, 0), 6, '0') as deposit_amount, LPAD(ROUND(balance_amount, 0), 6, '0') as balance_amount, DATE_FORMAT(transaction_date, '%d.%m.%y') as transaction_date, DATE_FORMAT(transaction_date, '%H.%i.%s') as transaction_time,LPAD(receipt_no, 5, '0') as receipt_no";
            var whr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}'  AND agent_trans_no='${transitionNumber}' AND agent_trans_no IS NOT NULL`;
            
            let res_dt = await db_Select(select_q, "td_collection", whr, null);
            // console.log("=====================", res_dt)
            
            const formattedDate = dateFormat(new Date(), "dd.MM.yy"),
            currTime = dateFormat(new Date(), "HH.MM.ss")
            
            let formattedData = '', tot_coll_amt = 0, tot_coll = 0, 
            agent_code_final = await createStrWithZero(3, agent_code.toString(), '0', 'S'), last_ac_no = 0;
    
            if(res_dt.suc > 0){
                last_ac_no = res_dt.msg.length > 0 ? res_dt.msg[res_dt.msg.length - 1].account_number : 0;
                for(let item of res_dt.msg){
                    const {
                      branch_code,
                      product_code,
                      account_number,
                      name,
                      deposit_amount,
                      balance_amount,
                      transaction_date,
                      transaction_time,
                      receipt_no,
                    } = item;
                    const formattedLine = `${account_number},${deposit_amount},${name},${balance_amount},${transaction_date},${deposit_amount}  `;
                    formattedData += formattedLine + "\n";
                    tot_coll_amt += parseFloat(deposit_amount)
                    tot_coll++
                }
            }
    
            let tot_col_amt_final = await createStrWithZero(6, tot_coll_amt.toString(), '0', 'P'),
            tot_col_count = await createStrWithZero(6, tot_coll.toString(), '0', 'P'),
            tot_col_amount_final = await createStrWithZero(16, tot_col_amt_final.toString(), ' ', 'S');
            let col_header = `${last_ac_no},${tot_col_count},${tot_col_amount_final},${res_dt.msg[0].branch_code}${agent_code_final},${formattedDate},12341234`;
    
            formattedData = col_header + '\n' + formattedData
    
            const text = formattedData + "";
            // console.log(text, 'LAALALLALALALALAL');
            resolve(text)
        }catch(err){
            console.log(err);
            reject(err)
        }
    })
}

const normal_version_download = (user_data, agent_code, transitionNumber) => {
    return new Promise(async (resolve, reject) => {
        var select_q = "LPAD(UPPER(branch_code), 3, '0') as branch_code,RPAD(UPPER(product_code), 5, ' ') as product_code,RPAD(account_number, 19, ' ') as account_number,RPAD(UPPER(account_holder_name), 20, ' ') as name,LPAD(deposit_amount, 10, '0') as deposit_amount, DATE_FORMAT(transaction_date, '%d.%m.%y') as transaction_date, DATE_FORMAT(transaction_date, '%H.%i.%s') as transaction_time,LPAD(receipt_no, 5, '0') as receipt_no";
        var whr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}'  AND agent_trans_no='${transitionNumber}' AND agent_trans_no IS NOT NULL`;
        
        let res_dt = await db_Select(select_q, "td_collection", whr, null);
        // console.log("=====================", res_dt)
        
        const formattedDate = dateFormat(new Date(), "dd.MM.yy"),
        currTime = dateFormat(new Date(), "HH.MM.ss")
        
        let formattedData = '', tot_coll_amt = 0, tot_coll = 1, 
        agent_code_final = await createStrWithZero(10, agent_code.toString(), '0', 'P');

        if(res_dt.suc > 0){
            for(let item of res_dt.msg){
                const {
                    branch_code,
                    product_code,
                    account_number,
                    name,
                    deposit_amount,
                    transaction_date,
                    transaction_time,
                    receipt_no
                } = item;
                const formattedLine = `${branch_code},${product_code},${account_number},${name},${deposit_amount},${transaction_date},${receipt_no}`;
                formattedData += formattedLine + "\n";
                tot_coll_amt += parseFloat(deposit_amount)
                tot_coll++
            }
        }

        let tot_col_amt_final = await createStrWithZero(19, tot_coll_amt.toString(), '0', 'P'),
        tot_col_final = await createStrWithZero(20, tot_coll.toString(), '0', 'P');
        let col_header = `000,12345,${tot_col_amt_final},${tot_col_final},${agent_code_final},${formattedDate},12345`

        formattedData = col_header + '\n' + formattedData

        const text = formattedData + "";
        resolve(text)
    })
}

const fetch_pcrx_file3 = async (req, res) => {
    try {
        const agent_code = req.query.agent_code;
        const fDate = req.query.fDate;
        const tDate = req.query.tDate;
        const transitionNumber = req.query.transaction_number;
        const user_data = req.session.user.user_data.msg[0];

        let whereordb = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}'  AND agent_trans_no='${transitionNumber}'`;
        // const delst=await F_Delete(user_data.bank_id, 'TD_COLLECTION', whereordb);
        var whr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}'  AND agent_trans_no='${transitionNumber}' AND agent_trans_no IS NOT NULL AND download_flag = 'N'`;
        let res_dt = await db_Select('*', "td_collection", whr, null);



        for (let lData of res_dt.msg) {

            let fields = `receipt_no, agent_trans_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number, account_holder_name, deposit_amount, download_flag, collection_by, collected_at`;
            let values = [lData.receipt_no, lData.agent_trans_no, lData.bank_id, lData.branch_code, lData.agent_code, dateFormat(lData.transaction_date, "dd-mmm-yy"), lData.account_type, lData.product_code, lData.account_number, lData.account_holder_name, lData.deposit_amount, 'Y', lData.collection_by, lData.collected_at];
            // let values=[lData.receipt_no,lData.agent_trans_no,lData.bank_id,lData.branch_code,lData.agent_code,dateFormat(lData.transaction_date, "dd-mmm-yy"),lData.account_type,lData.product_code,lData.account_number,lData.account_holder_name,lData.deposit_amount,lData.download_flag,lData.collection_by,lData.collected_at];
            let val = `:0, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10,:11,:12,:13`;

            await F_Insert(user_data.bank_id, "TD_COLLECTION", fields, val, values, null, 0)
        }

        var whr3 = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}' AND download_flag='N' AND agent_trans_no IS NOT NULL`,
            fields = `download_flag='Y'`;
        await db_Insert("td_collection", fields, null, whr3, 1)

        return res.json(true);
        // res.redirect('/admin/download_pcrx');
    } catch (error) {
        return res.json({ error: error });
        // res.redirect('/admin/download_pcrx');
    }
}




const fetch_pcrx_file = async (req, res) => {
    try {
        const agent_code = req.query.agent_code;
        const fDate = req.query.fDate;
        const tDate = req.query.tDate;
        const transitionNumber = req.query.transaction_number;
        const user_data = req.session.user.user_data.msg[0];

        let whereordb = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}'  AND agent_trans_no='${transitionNumber}'`;
        // const delst=await F_Delete(user_data.bank_id, 'TD_COLLECTION', whereordb);
        var whr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}'  AND agent_trans_no='${transitionNumber}' AND agent_trans_no IS NOT NULL AND download_flag = 'N'`;
        let res_dt = await db_Select('*', "td_collection", whr, null);

        console.log('-=-=-=-=-=', res_dt)

        const dbdataarrayOfArrays = res_dt.msg.map((lData) => {
            return {
                a: lData.receipt_no,
                b: lData.agent_trans_no,
                c: lData.bank_id,
                d: lData.branch_code,
                e: lData.agent_code,
                f: dateFormat(lData.transaction_date, "dd-mmm-yy"),
                g: lData.account_type,
                h: lData.product_code,
                i: lData.account_number,
                j: lData.account_holder_name,
                k: lData.deposit_amount,
                l: 'Y',
                m: lData.collection_by,
                n: dateFormat(lData.collected_at, "dd-mmm-yy")
            }
        });
        try {
            var uploaddb = await F_insert_bulk_data(user_data.bank_id, dbdataarrayOfArrays);
            if (uploaddb.suc == 1) {
                var whr3 = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}' AND agent_code='${agent_code}' AND download_flag='N' AND agent_trans_no IS NOT NULL`,
                    fields = `download_flag='Y'`;
                await db_Insert("td_collection", fields, null, whr3, 1)
                return res.json({ststus: true, uploaddb:uploaddb});
            } else {
                return res.json({ststus: false, uploaddb:uploaddb});
            }
            

        } catch (error) {
            console.log(error)

            return res.json(false);
        }


        // const dbdataarrayOfArrays = [];

        // for (const lData of res_dt.msg) {
        //     dbdataarrayOfArrays.push([
        //     lData.receipt_no,
        //     lData.agent_trans_no,
        //     lData.bank_id,
        //     lData.branch_code,
        //     lData.agent_code,
        //     dateFormat(lData.transaction_date, "dd-mmm-yy"),
        //     lData.account_type,
        //     lData.product_code,
        //     lData.account_number,
        //     lData.account_holder_name,
        //     lData.deposit_amount,
        //     'Y',
        //     lData.collection_by,
        //     lData.collected_at
        //     ]);
        // }




        // res.redirect('/admin/download_pcrx');
    } catch (error) {
        return res.json({ error: error });
        // res.redirect('/admin/download_pcrx');
    }
}




const show_upload_account = async (req, res) => {
    const user_data = req.session.user.user_data.msg[0];
    var whrDAta = `a.user_id=b.agent_code AND a.bank_id=b.bank_id AND a.branch_code=b.branch_code AND a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}'  AND a.active_flag='Y'AND a.user_type='O'`,
        selectData = "a.user_id,b.agent_name";
    let dbuser_data = await db_Select(selectData, "md_user a, md_agent b", whrDAta, null);
    var viewData = {
        title: "UPLOAD ACCOUNT LIST",
        page_path: "/uploaded_data/show_upload_data",
        data: dbuser_data.msg
    };
    res.render('common/layouts/main', viewData)
}


const fetch_show_account = async (req, res) => {
    try {
        const schema = Joi.object({
            agent_code: Joi.string().required(),
            // date: Joi.string().required()
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
        // var whrDAta = `a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}'  AND a.agent_code='${value.agent_code}' AND a.opening_date='${value.date}'`,
        // var whrDAta = `a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}'  AND a.agent_code='${value.agent_code}'`,
        //     selectData = "a.*,b.mobile_no",
        //     table = `td_account_dtls as a LEFT JOIN md_mobile_dtls AS b ON a.account_number = b.acc_num AND b.bank_id='${user_data.bank_id}' AND b.branch_code='${user_data.branch_code}'`;
        // let dbuser_data = await db_Select(selectData, table, whrDAta, null);

        var whrDAta = `a.bank_id='${user_data.bank_id}' AND a.branch_code='${user_data.branch_code}'  AND a.agent_code='${value.agent_code}'`,
            selectData = "a.*",
            table = `td_account_dtls as a`;
        let dbuser_data = await db_Select(selectData, table, whrDAta, null);

        res.json({
            "SUCCESS": data,
            "status": false
        });
    } catch (error) {
        res.json({
            "SUCCESS": error,
            "status": false
        });
    }
}

const del_all_pctx_file_data = async (req, res) => {
    try {
        const schema = Joi.object({
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

        const user_data = req.session.user.user_data.msg[0];
        let delwhr = `bank_id='${user_data.bank_id}' AND branch_code='${user_data.branch_code}'  AND agent_code='${value.agent_code}'`;

        var res_del = await db_Delete("td_account_dtls", delwhr)
        console.log("**********************", res_del)
        res.json({
            "SUCCESS": res_del,
            "status": true
        });
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
}


const fetchdata_to_server = async (req, res) => {
    try {
        const schema = Joi.object({
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
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        const user_data = req.session.user.user_data.msg[0];


        //db connection
		//AND a.MAT_DT>sysdate 
        let fields = "a.brn_cd,a.acc_num,b.cust_name,to_char(a.opening_dt,'yyyy-mm-dd') opening_dt,a.prn_amt,b.phone ",
            table_name = "TM_DEPOSIT a, MM_CUSTOMER b",
            where = `a.CUST_CD = b.CUST_CD AND a.ACC_TYPE_CD = 11 AND nvl(a.acc_status,'O') = 'O' AND a.constitution_cd !=1 AND a.brn_cd = ${user_data.branch_code} AND a.agent_cd = ${value.agent_code} ${user_data.after_maturity_coll != 'Y' ? 'AND a.MAT_DT>sysdate' : ''}`,
            order = null,
            flag = 1;
        let tableDate = await F_Select(user_data.bank_id, fields, table_name, where, order, flag, full_query = null);
        console.log("**********************", tableDate)

        for (let dbdata of tableDate.msg) {
            try {
                var fields2 = '(bank_id, branch_code, agent_code, upload_dt, deposit_loan_flag, acc_type, product_code, account_number,mobile_no, customer_name, opening_date, current_balance, uploaded_by, upload_at)',
                    values = `('${user_data.bank_id}','${user_data.branch_code}','${value.agent_code}','${datetime}','D','D','DDSD',${dbdata.ACC_NUM},${dbdata.PHONE},'${dbdata.CUST_NAME}', '${dbdata.OPENING_DT}','${dbdata.PRN_AMT}','${user_data.id}','${datetime}')`;

                var res_dt = await db_Insert("td_account_dtls", fields2, values, null, 0);
                er = true
            } catch (error) {
                er = error
            }

        }
        (er == true) ? res.json(er) : res.json(er)
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
}
module.exports = { fetch_pcrx_file, upload_pctx, upload_pctx_file_data, download_pcrx, download_pcrx_file, create_agent_trans, show_upload_account, fetch_show_account, del_all_pctx_file_data, fetchdata_to_server, update_agent_amount }