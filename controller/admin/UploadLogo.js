const Joi = require("joi");
const { db_Select, db_Insert } = require("../../model/MasterModule");
const dateFormat = require('dateformat');

const bank_list_logo = async (req, res) => {
  var bank = await db_Select("*", "md_bank", null, null);
  const viewData = {
    title: "Logo",
    page_path: "/logo_upload/bank_logo",
    data: bank,
  };
  res.render("common/layouts/main", viewData);
};

const upload_logo = async (req, res) => {
    // console.log(data);
    if(req.method === "POST") {
        var data = req.body;
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
        if (uploadedFile.size > 2 * 1024 * 1024) {
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
              var chk_img = await db_Select('id, file_path', "td_logo", `bank_id = '${data.bank}'`, null);
              var up_flag = chk_img.suc > 0 && chk_img.msg.length > 0 ? true : false;
              if (up_flag) {
                  let filePathToDelete = "uploads/bank_logo/" + chk_img.msg[0].file_path;
      
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
              res.redirect("/admin/upload_logo");
            console.log(res_dt);
          }
        });
    }else{
        var data = req.query,
            user = req.session.user.user_data.msg[0];
        var bank = await db_Select("*", "md_bank", user.user_type == 'B' ? `bank_id=${user.bank_id}` : null, null);
        var logo_data = {suc: 0, msg: []};
        if (user.user_type == 'B'){
            let select = "a.bank_id, a.file_path, b.bank_name",
                table_name = "td_logo a, md_bank b",
                whr = `a.bank_id = b.bank_id AND a.bank_id = '${user.bank_id}'`;
            logo_data = await db_Select(select, table_name, whr, null);
        }
        const viewData = {
            title: "Upload Logo",
            page_path: "/logo_upload/bank_logo",
            data: logo_data.suc > 0 ? logo_data.msg : [],
            bank_dt: bank,
            bank_id: user.user_type == 'B' ? user.bank_id : "0",
        };
        res.render("common/layouts/main", viewData);
    }
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



module.exports = {upload_logo};