const { db_Select, db_Insert, db_Delete } = require("../model/MasterModule"),
    dateFormat = require('dateformat'),
    fs = require('fs'),
    path = require('path');

const dataBackup = async () => {
    try{
        const agentTrnsData = await db_Select('DISTINCT a.sl_no agent_trns_id, a.agent_trans_no, a.bank_id, a.branch_code, a.agent_code, a.received_date', 'md_agent_trans a, td_collection b', `a.agent_trans_no=b.agent_trans_no AND a.bank_id=b.bank_id AND a.branch_code=b.branch_code AND a.agent_code=b.agent_code AND a.agent_trans_no IS NOT NULL AND a.coll_flag = 'N' AND a.end_flag = 'Y' AND b.download_flag = 'Y' AND a.bank_id != 3`, `HAVING 
-- TIMESTAMPDIFF(MONTH, received_date, DATE(NOW())) >= 1 OR 
a.received_date <= LAST_DAY(CURDATE())- INTERVAL 1 MONTH`)
        if(agentTrnsData.suc > 0){
            if (agentTrnsData.msg.length > 0){
                for(let agentTrns of agentTrnsData.msg){
                    let { agent_trns_id, agent_trans_no , bank_id, branch_code, agent_code, received_date } = agentTrns;
                    try{
                        var agentTrnsInsert = await db_Insert('databank_databackup.md_agent_trans', null, null, null, 0, true, `(SELECT * FROM databank.md_agent_trans a WHERE a.sl_no = ${agent_trns_id} AND a.agent_trans_no = '${agent_trans_no}' AND a.bank_id = ${bank_id} AND a.branch_code = '${branch_code}' AND a.agent_code = '${agent_code}')`)
                        // console.log(agentTrnsInsert);

                        if(agentTrnsInsert.suc > 0){
                            var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Data with agent transaction code: ${agent_trans_no} of agent ${agent_code} has been successfully backed up. \n`;
                            WriteLogFile(txt);
                            var collectionInsert = await db_Insert('databank_databackup.td_collection', null, null, null, 0, true, `(SELECT * FROM databank.td_collection a WHERE a.agent_trans_no = '${agent_trans_no}' AND a.bank_id = ${bank_id} AND a.branch_code = '${branch_code}' AND a.agent_code = '${agent_code}' AND a.download_flag = 'Y')`)
                            if(collectionInsert.suc > 0){
                                var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Data with agent transaction code: ${agent_trans_no} of agent ${agent_code} collection has been successfully backed up. \n`;
                                WriteLogFile(txt);
                                var delAgentTrns = await db_Delete('md_agent_trans', `sl_no = ${agent_trns_id} AND agent_trans_no = '${agent_trans_no}' AND bank_id = ${bank_id} AND branch_code = '${branch_code}' AND agent_code = '${agent_code}'`)
                                if (delAgentTrns.suc > 0){
                                    var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Data with agent transaction code: ${agent_trans_no} of agent ${agent_code} has been successfully deleted from main table. \n`;
                                    WriteLogFile(txt);
                                }else{
                                    var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR] : ${delAgentTrns.msg} \n`;
                                    txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR/${agent_code}] : Error occurs while deleting the agent transaction data of agent transaction code: ${agent_trans_no}. \n`
                                    WriteLogFile(txt);
                                }
                                var delAgentCol = await db_Delete('td_collection', `agent_trans_no = '${agent_trans_no}' AND bank_id = ${bank_id} AND branch_code = '${branch_code}' AND agent_code = '${agent_code}' AND download_flag = 'Y'`)
                                if (delAgentCol.suc > 0){
                                    var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Collection data with agent transaction code: ${agent_trans_no} of agent ${agent_code} has been successfully deleted from main table. \n`;
                                    WriteLogFile(txt);
                                }else{
                                    var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR] : ${delAgentCol.msg} \n`;
                                    txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR/${agent_code}] : Error occurs while deleting the collection data of agent transaction code: ${agent_trans_no}. \n`
                                    WriteLogFile(txt);
                                }
                            }else{
                                var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR] : ${collectionInsert.msg} \n`;
                                txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR/${agent_code}] : Error occurs while backing up the collection data of agent transaction code: ${agent_trans_no}. \n`
                                WriteLogFile(txt);
                            }
                        }else{
                            var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR] : ${agentTrnsInsert.msg} \n`;
                            txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR/${agent_code}] : Error occurs while backing up the agent transaction data of agent transaction code: ${agent_trans_no}. \n`
                            WriteLogFile(txt);
                        }
                        
                    }catch(err){
                        var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${err} \n`;
                        txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/${agent_code}] : Error while processing the agent transaction data. \n`
                        WriteLogFile(txt);
                    }

                    // break; // Remove this break after testing one record
                }
            }else{
                var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/NO DATA FOUND] : ${agentTrnsData.msg} \n`;
                txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/NO DATA FOUND] : No data found for backup. \n`
                WriteLogFile(txt);
            }
        }else{
            var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR] : ${agentTrnsData.msg} \n`;
            txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR/${agent_code}] : Error while processing the agent data. \n`
            WriteLogFile(txt);
        }
    }catch(err){
        var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR] : ${err} \n`;
        txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}/ERROR] : Error while processing the data backup. \n`
        WriteLogFile(txt);
    }
}

const WriteLogFile = (text) => {
    fs.appendFileSync(path.join(__dirname, "outputDataBackupScheduler.txt"), text);
}

dataBackup().then(() => {
    process.exit(0); // success
}).catch(err => {
    console.error("Scheduler failed:", err);
    process.exit(1); // failure
});