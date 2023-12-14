const { db_Select } = require("../../model/MasterModule");

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


module.exports={agent_list}