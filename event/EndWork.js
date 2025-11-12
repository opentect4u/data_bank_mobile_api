const { db_Select, db_Insert } = require("../model/MasterModule"),
dateFormat = require('dateformat'),
fs = require('fs'),
path = require('path');

const endWorkDone = async () => {
    try{
        const agentDtls = await db_Select('a.bank_id,a.branch_code,a.agent_code,a.agent_name,a.allow_collection_days', 'md_agent a, md_user b', `a.bank_id=b.bank_id AND a.branch_code=b.branch_code AND a.agent_code=b.user_id AND b.user_type='O' AND b.active_flag = 'Y' AND a.allow_collection_days IS NOT NULL`, null)
        if(agentDtls.suc > 0){
            if (agentDtls.msg.length > 0){
                for(let agent of agentDtls.msg){
                    let allowDays = agent.allow_collection_days,
                        bankId = agent.bank_id,
                        branchCode = agent.branch_code,
                        agentCode = agent.agent_code,
                        agentName = agent.agent_name;
                    try{
                        let agentTrnsDt = await db_Select(`sl_no, agent_code, send_date, DATEDIFF('${dateFormat(new Date(), 'yyyy-mm-dd')}', send_date) tot_days`, 'md_agent_trans', `agent_trans_no is null and coll_flag = 'Y' and end_flag = 'N' and bank_id='${bankId}' AND branch_code = '${branchCode}' AND agent_code = '${agentCode}'`, `HAVING tot_days >= ${+allowDays} LIMIT 1`)
            
                        if (agentTrnsDt.suc > 0) {
                            if (agentTrnsDt.msg.length > 0){
                                let dbvalers = `agent_trans_no='${((agent.agent_code).toString() + (agentTrnsDt.msg[0].sl_no).toString()).toString()}'`,
                                    dbwhere = `bank_id='${bankId}'AND branch_code='${branchCode}'AND agent_code='${agentCode}' AND agent_trans_no IS NULL AND transaction_date BETWEEN '${dateFormat(new Date(agentTrnsDt.msg[0].send_date), "yyyy-mm-dd")}' AND '${dateFormat(new Date(), "yyyy-mm-dd")}'`;
                                let update_res = await db_Insert("td_collection", dbvalers, null, dbwhere, 1);
                                if (update_res.suc > 0) {
                                    let fields = `agent_trans_no ='${((agent.agent_code).toString() + (agentTrnsDt.msg[0].sl_no).toString()).toString()}', coll_flag='N', received_date='${dateFormat(new Date(), "yyyy-mm-dd")}', end_flag='Y'`,
                                        wherre = `sl_no = ${agentTrnsDt.msg[0].sl_no}`;
                                    let res_dt = await db_Insert("md_agent_trans", fields, null, wherre, 1);
                                    if (res_dt.suc > 0){
                                        var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${res_dt.msg} \n`;
                                        txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/${agentCode}/${agentName}] : Successfully updated agent transaction -- ${((agent.agent_code).toString() + (agentTrnsDt.msg[0].sl_no).toString()).toString()}. \n`;
                                        WriteLogFile(txt);
                                    }else{
                                        var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${res_dt.msg} \n`;
                                        txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/${agentCode}/${agentName}] : Error while updating agent transaction. \n`;
                                        WriteLogFile(txt);
                                    }
                                } else {
                                    var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${update_res.msg} \n`;
                                    txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Error while updating agent collection. \n`;
                                    WriteLogFile(txt);
                                }
                            }
                        }else{
                            var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${agentTrnsDt.msg} \n`;
                            txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Error occurs while fetching data from agent transaction table. \n`;
                            WriteLogFile(txt);
                        }
                    }catch(err){
                        var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${err} \n`;
                        txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Error while processing the agent data. \n`
                        WriteLogFile(txt);
                    }
                }
            }else{
                var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : No data found form agent data. \n`
                WriteLogFile(txt);
            }
        }else{
            var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${agentDtls.msg} \n`;
            txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Error while fetching the data from agent master \n`
            WriteLogFile(txt);
        }
    }catch(err){
        throw err;
    }
}

const WriteLogFile = (text) => {
    fs.appendFileSync(path.join(__dirname, "outputScheduler.txt"), text);
}

endWorkDone().then(() => {
    process.exit(0); // success
}).catch(err => {
    console.error("Scheduler failed:", err);
    process.exit(1); // failure
});