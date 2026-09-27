const Joi = require("joi");
const { db_Select, db_Insert, db_Delete } = require("../../model/MasterModule");
const dateFormat = require('dateformat');

module.exports = {
    holiday_entry: async (req, res) => {
        try {
            const user_data = req.session.user.user_data.msg[0];
            let select = 'id, bank_id, frm_dt, to_dt, remarks',
                table_name = 'td_holiday',
                whr = `bank_id=${user_data.bank_id} AND to_dt >= '${dateFormat(new Date(), "yyyy-mm-dd")}'`,
                order = 'ORDER BY frm_dt DESC';
            const resData = await db_Select(select, table_name, whr, order)
            // console.log("======///////////=======",resData)
            delete resData.sql
            var viewData = {
                title: "Holiday Entry",
                page_path: "/holiday_entry/view",
                data: resData
            };
            res.render('common/layouts/main', viewData)
        } catch (error) {
            res.json({
                "error": error,
                "status": false
            });
        }
    },
    holiday_entry_post: async (req, res) => {
        try {
            const schema = Joi.object({
                frm_dt: Joi.required(),
                to_dt: Joi.required(),
                remarks: Joi.string().allow('').optional().default(''),
                id: Joi.number().optional().default(0)
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
            const currDate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
            const remarks = value.remarks.replace(/'/g, "''")

            let fields = value.id > 0 ? `frm_dt = '${dateFormat(value.frm_dt, "yyyy-mm-dd")}', to_dt = '${dateFormat(value.to_dt, "yyyy-mm-dd")}', remarks = '${remarks}', modified_by = '${user_data.id}', modified_dt = '${currDate}'` : '(bank_id, frm_dt, to_dt, remarks, created_by, created_dt)',
                values = value.id > 0 ? null : `('${user_data.bank_id}','${dateFormat(value.frm_dt, "yyyy-mm-dd")}','${dateFormat(value.to_dt, "yyyy-mm-dd")}','${remarks}','${user_data.id}','${currDate}')`,
                whr = value.id > 0 ? `id=${value.id} AND bank_id=${user_data.bank_id}` : null,
                flag = value.id > 0 ? 1 : 0;
            let res_dt = await db_Insert("td_holiday", fields, values, whr, flag);
            // console.log('========user==========', res_dt)
            if (res_dt.suc > 0){
                req.flash('success', res_dt.msg)
            }else{
                req.flash('error', 'There was an error while saving the holiday entry. Please try again.')
            }

            res.redirect('/bank/holiday_entry')
        } catch (error) {
            res.json({
                "error": error,
                "status": false
            });
        }
    },
    delete_holiday: async (req, res) => {
        try {
            const schema = Joi.object({
                id: Joi.number().required()
            });
            const { error, value } = schema.validate(req.query, { abortEarly: false });
            if (error) {
                const errors = {};
                error.details.forEach(detail => {
                    errors[detail.context.key] = detail.message;
                });
                return res.json({ error: errors });
            }

            const user_data = req.session.user.user_data.msg[0];
            let res_dt = await db_Delete("td_holiday", `id=${value.id} AND bank_id=${user_data.bank_id}`);
            if (res_dt.suc > 0){
                req.flash('success', res_dt.msg)
            }else{
                req.flash('error', 'There was an error while deleting the holiday entry. Please try again.')
            }

            res.redirect('/bank/holiday_entry')
        } catch (error) {
            res.json({
                "error": error,
                "status": false
            });
        }
    }
}
