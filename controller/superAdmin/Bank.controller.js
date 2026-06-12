const Joi = require("joi");
const { db_Select, db_Insert, MAX_DATE_COL_ENTRY_FLAG } = require("../../model/MasterModule");
const dateFormat = require("dateformat");
const bcrypt = require("bcrypt");
const fileUpload = require("express-fileupload");
fs = require("fs");
const path = require("path");

const bank_list = async (req, res) => {
  var select = "*",
    table_name = "md_bank",
    whr = `active_flag='Y'`;
  order = null;
  var bank = await db_Select(select, table_name, whr, order);
  const viewData = {
    max_dt_col_entry_flag: MAX_DATE_COL_ENTRY_FLAG,
    title: "Adminn",
    page_path: "/bank/viewBank",
    data: bank,
  };
  res.render("common/layouts/main", viewData);
};

const inactive_bank_list = async (req, res) => {
  var select = "*",
    table_name = "md_bank",
    whr = `active_flag='N'`;
  order = null;
  var bank = await db_Select(select, table_name, whr, order);
  const viewData = {
    title: "Adminn",
    page_path: "/bank/inactiveBank",
    data: bank,
  };
  res.render("common/layouts/main", viewData);
};

const add_bank_list = async (req, res) => {
  try {
    const schema = Joi.object({
      bank_name: Joi.string().required(),
      contact_person: Joi.string().required(),
      mobile: Joi.number().required(),
      bank_address: Joi.string().required(),
      email: Joi.string().required(),
      device_type: Joi.string().required(),
      data_version: Joi.string().valid("S", "C", "N").required(),
      data_transfer_type: Joi.string().valid("M", "A").required(),
      receipt_type: Joi.string().valid("S", "P", "B").required(),
      active_flag: Joi.string().valid("Y", "N").required(),
      max_day_entry_flag: Joi.string().valid("D", "R").required(),
      password: Joi.string().required(),
      max_user: Joi.number().required(),
      confirmPassword: Joi.string().required().valid(Joi.ref("password")),
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.context.key] = detail.message;
      });

      // req.flash("error", errors);
      res.redirect("/super-admin/bank");

      // return res.status(400).json({ error: errors });
    }

    let pss = value.password;
    let enc_pss = bcrypt.hashSync(pss, 10);

    const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const user_data = req.session.user.user_data.msg[0];
    var fields = `(bank_name, bank_address, contact_person, phone_no, email_id, device_type, data_version, data_trf, receipt_type, max_day_entry_flag, max_user, created_by, created_at, active_flag)`,
      values = `('${value.bank_name}','${value.bank_address}','${value.contact_person}','${value.mobile}','${value.email}','${value.device_type}','${value.data_version}','${value.data_transfer_type}','${value.receipt_type}', '${value.max_day_entry_flag}', '${value.max_user}','${user_data.id}','${datetime}','${value.active_flag}')`;
    var insmd_bank = await db_Insert("md_bank", fields, values, null, 0);
    var adduser = "";
    if (insmd_bank.lastId.insertId) {
      var fields = `( bank_id, user_type, password, user_id, active_flag, created_by, created_at)`,
        values = `('${insmd_bank.lastId.insertId}','B','${enc_pss}','${value.email}','Y','${user_data.id}','${datetime}')`;
      var adduser = await db_Insert("md_user", fields, values, null, 0);
    }
    //res.send({insmd_bank:insmd_bank,adduser:adduser});
    // req.flash("success","Bank Add Successful");
    res.redirect("/super-admin/bank");
  } catch (error) {
    // req.flash("error", error);
    // res.redirect("/super-admin/bank");
    // return res.status(400).json({ error: error });
  }
};

const edit_bank_list = async (req, res) => {
  var data = await db_Select(
    "*",
    "md_bank",
    `bank_id=${req.query.bank_id}`,
    null
  );
  // console.log(data, 'lalal');
  const viewData = {
    title: "Adminn",
    page_path: "/bank/edit_viewBank",
    max_dt_col_entry_flag: MAX_DATE_COL_ENTRY_FLAG,
    data: data.suc > 0 && data.msg.length > 0 ? data.msg[0] : [],
    bank_id: req.query.bank_id,
  };
  res.render("common/layouts/main", viewData);
};

const edit_inactive_bank_list = async (req, res) => {
  var data = await db_Select(
    "*",
    "md_bank",
    `bank_id=${req.query.bank_id}`,
    null
  );
  // console.log(data, 'lalal');
  const viewData = {
    title: "Adminn",
    page_path: "/bank/edit_inactiveBank",
    data: data.suc > 0 && data.msg.length > 0 ? data.msg[0] : [],
    bank_id: req.query.bank_id,
  };
  console.log(viewData);
  res.render("common/layouts/main", viewData);
};
const edit_bank_list_save = async (req, res) => {
  try {
    const schema = Joi.object({
      bank_name: Joi.string().required(),
      contact_person: Joi.string().required(),
      mobile: Joi.number().required(),
      bank_address: Joi.string().required(),
      email: Joi.string().required(),
      device_type: Joi.string().required(),
      data_version: Joi.string().valid("S", "C", "N").required(),
      data_transfer_type: Joi.string().valid("M", "A").required(),
      receipt_type: Joi.string().valid("S", "P", "B").required(),
      active_flag: Joi.string().valid("Y", "N").required(),
      max_day_entry_flag: Joi.string().valid("D", "R").required(),
      max_user: Joi.number().required(),
      sucurity_amt_type: Joi.optional(),
      after_maturity_coll: Joi.optional(),
      start: Joi.optional(),
      bank_id: Joi.required()
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.context.key] = detail.message;
      });
      console.log(error);
      res.redirect("/super-admin/test");
    }

    const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const user_data = req.session.user.user_data.msg[0];
    // console.log(user_data);
    var table_name = "md_bank",
      fields = `bank_name ='${value.bank_name}', bank_address = '${value.bank_address}', contact_person = '${value.contact_person}', phone_no = '${value.mobile}', email_id ='${value.email}', device_type = '${value.device_type}', data_version = '${value.data_version}', data_trf = '${value.data_transfer_type}', 
        receipt_type = '${value.receipt_type}', sec_amt_type = '${value.sucurity_amt_type}', active_flag = '${value.active_flag}', after_maturity_coll = '${value.after_maturity_coll}', max_day_entry_flag = '${value.max_day_entry_flag}', max_user = '${value.max_user}', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id=${value.bank_id}`;
    var insmd_bank = await db_Insert(table_name, fields, values, whr, 1);

    var table_name = "md_branch",
      fields2 = `active_flag = '${value.active_flag}', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id= ${value.bank_id} AND active_flag = 'Y'`;
    var bank = await db_Insert(table_name, fields2, values, whr, 1);
    // console.log(bank);

    var table_name = "md_agent",
      fields3 = `active_flag = '${value.active_flag}', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id= ${value.bank_id} AND active_flag = 'Y'`;
    var agent = await db_Insert(table_name, fields3, values, whr, 1);

    var table_name = "md_user",
      fields4 = `active_flag = '${value.active_flag}', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id= ${value.bank_id} AND active_flag = 'Y'`;
    var user = await db_Insert(table_name, fields4, values, whr, 1);
    
    req.flash("success","Bank updated successfully")
    res.redirect("/super-admin/bank");
  } catch (error) {
    console.log(error);
    req.flash("error","Bank not updated successfully")
    res.redirect(`/super-admin/bank`);
  }
};

const edit_inactive_bank_list_save = async (req, res) => {
  var data = req.body;
  // console.log(data);
  try {
    const schema = Joi.object({
      active_flag: Joi.string().valid("Y", "N").required(),
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    console.log(value);
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.context.key] = detail.message;
      });
      // res.redirect('/super-admin/inactive_bank')
    }

    const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const user_data = req.session.user.user_data.msg[0];

    var table_name = "md_bank",
      fields = `active_flag = 'Y', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id= ${value.bank_id} AND active_flag = 'N'`;
    var insmd_bank = await db_Insert(table_name, fields, values, whr, 1);

    var table_name = "md_branch",
      fields2 = `active_flag = 'Y', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id= ${value.bank_id} AND active_flag = 'N'`;
    var bank = await db_Insert(table_name, fields2, values, whr, 1);
    // console.log(bank);

    var table_name = "md_agent",
      fields3 = `active_flag = 'Y', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id= ${value.bank_id} AND active_flag = 'N'`;
    var bank = await db_Insert(table_name, fields3, values, whr, 1);

    var table_name = "md_user",
      fields4 = `active_flag = 'Y', modified_by = '${user_data.id}' , updated_at = '${datetime}'`,
      values = null;
    whr = `bank_id= ${value.bank_id} AND active_flag = 'N'`;
    var bank = await db_Insert(table_name, fields4, values, whr, 1);

    req.flash("success", "Inactive bank added to Active bank");
    res.redirect("/super-admin/inactive_bank");
  } catch (error) {
    console.log(error);
    req.flash("error", "Inactive bank not added to Active bank");
    res.redirect("/super-admin/inactive_bank");
  }
};

const bank_list_logo = async (req, res) => {
  var bank = await db_Select("*", "md_bank", null, null);
  const viewData = {
    title: "Logo",
    page_path: "/logo_upload/bank_logo",
    data: bank,
  };
  res.render("common/layouts/main", viewData);
};

const upload_bank_logo = async (req, res) => {
  var data = req.body;
  // console.log(data);

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFile = req.files.photo;
  // console.log(uploadedFile);

  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedFileTypes.includes(uploadedFile.mimetype)) {
    return res
      .status(400)
      .send("Invalid file type. Only JPEG and JPG and PNG are allowed.");
  }

  // Check file size
  //  console.log("//////////////",uploadedFile.size)
  if (uploadedFile.size > 1 * 1024 * 1024) {
    return res.status(400).send("File size exceeds the limit of 1 MB.");
  }

  // Move the file to a directory (you can modify the destination path as needed)
  let fileName = Date.now() + "_" + uploadedFile.name;
  uploadedFile.mv("uploads/bank_logo/" + fileName, async (err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

      const user_data = req.session.user.user_data.msg[0];
      let bank_img = data.bank_image;

      if (bank_img) {
        let filePathToDelete = "uploads/bank_logo/" + bank_img;

        if (fs.existsSync(filePathToDelete)) {
          fs.unlinkSync(filePathToDelete);
        }

        var table_name = "td_logo",
          fields = `file_path = '${fileName}', modified_by = 'Admin', updated_dt = '${datetime}'`,
          values = null;
        (whr = `bank_id= '${data.bank}'`), (flag = 1);
        res_dt = await db_Insert(table_name, fields, values, whr, flag);
      } else {
        var table_name = "td_logo",
          fields = `(bank_id, file_path, created_by, created_dt)`,
          values = `('${data.bank}','${fileName}','${user_data.id}','${datetime}')`;
        (whr = null), (flag = 0);
        res_dt = await db_Insert(table_name, fields, values, whr, flag);
      }

      req.flash("success", "Logo added Successful");
      res.redirect("/super-admin/logo");
      console.log(res_dt);
    }
  });
};

const get_logo_dtls = async (req, res) => {
  try {
    var data = req.body;
    let select = "a.bank_id, a.file_path, b.bank_name",
      table_name = "td_logo a, md_bank b",
      whr = `a.bank_id = b.bank_id AND a.bank_id = '${data.bank_id}'`;
    var resData = await db_Select(select, table_name, whr, null);
    // console.log(resData);
    res.json(resData);
  } catch (error) {
    res.json({
      suc: 0,
      msg: [],
    });
  }
};

module.exports = {
  bank_list,
  add_bank_list,
  edit_bank_list,
  edit_bank_list_save,
  inactive_bank_list,
  edit_inactive_bank_list,
  edit_inactive_bank_list_save,
  bank_list_logo,
  upload_bank_logo,
  get_logo_dtls,
};
