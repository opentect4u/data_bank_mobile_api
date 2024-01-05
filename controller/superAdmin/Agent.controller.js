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

const agent = async (req, res) => {
    try {
        var data = req.body
        let select = 'agent_id, agent_code, agent_name, phone_no',
            table_name = 'md_agent',
            whr = `bank_id = ${data.bank_id} AND branch_code = ${data.branch_id}`;
        var resData = await db_Select(select, table_name, whr, null)
        console.log(resData);
        res.json(resData)
        
    } catch (error) {
        res.json({
            "suc": 0,
            "msg": []
        });
    }
}

module.exports={agent_list,agent}