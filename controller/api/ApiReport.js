const Joi = require('joi');
const dateFormat = require('dateformat');
const { db_Select } = require('../../model/MasterModule');
const { RunProcedure, F_Select } = require('../../model/OrcModel');

const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")


const day_scroll_report = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let select = "DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,account_type,account_number,account_holder_name,deposit_amount, product_code",
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;
        let resData = await db_Select(select, "td_collection", where, null);

        delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });


    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }


}


const type_wise_report = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let select = "DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,account_number,account_holder_name,deposit_amount, product_code",
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;
        let resData = await db_Select(select, "td_collection", where, null);

        delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });


    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }


}


const non_collection_report = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }
        const datetime = dateFormat(new Date(), "yyyy-mm-dd")
        let select = "deposit_loan_flag,acc_type,product_code,account_number,mobile_no,customer_name,DATE_FORMAT(opening_date, '%Y-%m-%d') as opening_date,current_balance",
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number not in (select account_number from td_collection where bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_type='${value.account_type}' AND   transaction_date = '${datetime}') `;
        let resData = await db_Select(select, "td_account_dtls", where, null);

        // delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}


const mini_statement = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_number: Joi.number().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }


        let select = "DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,account_type,account_number,account_holder_name,deposit_amount",
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number='${value.account_number}' AND account_type='${value.account_type}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`;
        let resData = await db_Select(select, "td_collection", where, null);

        delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });




    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}





const date_wise_summary = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            //account_number: Joi.number().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }


        let select = "DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,SUM(deposit_amount) as deposit_amount, COUNT(account_number)as rcpts",
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN '${value.from_date}' AND '${value.to_date}'`,
            order = "GROUP BY transaction_date";
        let resData = await db_Select(select, "td_collection", where, order);

        delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });




    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
}

const date_wise_mini_statement = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_number: Joi.number().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // from_date: Joi.string().required(),
            // to_date: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 30);
        var acc_num = value.account_number,
            acc_type = 11;
        // frmdt = dateFormat(value.from_date, "dd/mm/yyyy"),
        // todt = dateFormat(value.to_date, "dd/mm/yyyy");
        // frmdt = dateFormat(currentDate, "dd/mm/yyyy"),
        // todt = dateFormat(new Date(), "dd/mm/yyyy");

        let select = `account_number acc_num, account_type trans_type, transaction_date PAID_DT, deposit_amount PAID_AMT, balance_amount BALANCE_AMT`,
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number=${acc_num} AND account_type='${value.account_type}'`,
            order = `ORDER BY collected_at desc`;
        var resDt = await db_Select(select, 'td_collection', where, order);
        /*  var pax_id = value.bank_id,
              fields = "acc_num, trans_type, paid_dt, paid_amt, balance_amt",
              table_name = "TM_DAILY_DEPOSIT",
              where = `brn_cd='${value.branch_code}' AND acc_num ='${acc_num}' AND PAID_DT BETWEEN TO_DATE('${frmdt}', 'dd/mm/yyyy') AND TO_DATE('${todt}', 'dd/mm/yyyy')`,
              order = 'ORDER BY PAID_DT DESC, TRANS_CD',
              flag = 1;
          var resDt = await F_Select(pax_id, fields, table_name, where, order, flag)*/

        console.log(resDt)

        res.json({
            "success": resDt,
            "status": true
        });



    } catch (error) {
        console.log(error)
        res.json({
            "error": error,
            "status": false
        });
    }
}


const account_wise_scroll_report = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_number: Joi.number().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
            //from_date: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 30);
        const from_date = dateFormat(currentDate, "yyyy-mm-dd")
        const to_date = dateFormat(new Date(), "yyyy-mm-dd")
        let select = "DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,account_type,account_number,account_holder_name,deposit_amount,receipt_no,collected_at",
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_number=${value.account_number} AND account_type='${value.account_type}'  AND transaction_date BETWEEN '${from_date}' AND '${to_date}'`;
        var orderdata = `ORDER BY transaction_date DESC`
        let resData = await db_Select(select, "td_collection", where, orderdata);

        delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });
    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
}

const last_five_transaction = async (req, res) => {
    try {
        const schema = Joi.object({
            bank_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            agent_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let select = "transaction_date,account_number,account_holder_name,deposit_amount",
            where = `bank_id=${value.bank_id} AND branch_code='${value.branch_code}' AND agent_code='${value.agent_code}' AND account_type='${value.account_type}'`;
        var orderdata = `order by collected_at desc limit 5`
        let resData = await db_Select(select, "td_collection", where, orderdata);



        res.json({
            "data": resData,
            "status": true
        });
    } catch (err) {
        res.json({
            "error": err,
            "status": false
        });
    }
}

// const 

module.exports = { day_scroll_report, type_wise_report, non_collection_report, mini_statement, date_wise_summary, date_wise_mini_statement, account_wise_scroll_report, last_five_transaction }