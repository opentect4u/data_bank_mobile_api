const chokidar = require('chokidar');
const fs = require('fs/promises');
const path = require('path');
const {db_Select, db_Insert} = require('../model/MasterModule'),
dateFormat = require('dateformat');

require('dotenv').config();

// Define your directories
const TARGET_DIR = path.join(__dirname, '../', process.env.RECEIVED_COLLECTION_FOLDER_PATH);
const ARCHIVE_DIR = path.join(__dirname, '../', process.env.RECEIVED_COLLECTION_FOLDER_PATH);
const ERROR_DIR = path.join(__dirname, '../', process.env.ERROR_COLLECTION_FOLDER_PATH);

const WriteLogFile = (text) => {
    fs.appendFileSync(path.join(__dirname, "offlineSyncLog.txt"), text);
}

// Your database insert function
async function insertIntoDatabase(jsonData) {
    console.log(`Inserting data for transaction: ${jsonData.agent_trans_no}`);

    try{
        if (jsonData.collection_dtls.length > 0){
            let chkTransNo = await db_Select('id, coll_flag, end_flag', 'md_agent_trans', `agent_trans_no='${jsonData.agent_trans_no}' AND bank_id='${jsonData.bank_id}' AND branch_code='${jsonData.branch_code}' AND agent_code='${jsonData.agent_code}'`);

            if(chkTransNo.suc > 0){
                if (chkTransNo.msg.length > 0){
                    if(chkTransNo.msg[0].coll_flag === 'N' && chkTransNo.msg[0].end_flag === 'Y'){
                        let errInsertColl = []
                        for(let dt of jsonData.collection_dtls){
                            try{
                                let fields = '(receipt_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number,account_holder_name, deposit_amount,balance_amount, collection_by, collected_at)',
                                    transData = dateFormat(dt.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                                    values = `('${dt.local_txn_no}','${jsonData.bank_id}','${jsonData.branch_code}','${jsonData.agent_code}','${transData}','${dt.account_type}','${dt.product_code}','${dt.account_number}','${dt.account_holder_name}','${dt.deposit_amount}','${dt.total_amount}','${dt.collection_by}','${transData}')`;
                                let res_dt = await db_Insert("td_collection", fields, values, null, 0);

                                if (res_dt.suc > 0){
                                    let setdata = `current_balance=${dt.total_amount}`,
                                        upwhere5 = `bank_id=${jsonData.bank_id} AND branch_code='${jsonData.branch_code}' AND agent_code='${jsonData.agent_code}' AND account_number='${dt.account_number}' AND product_code = '${dt.product_code}'`;
                                    let accDtInsert = await db_Insert("td_account_dtls", setdata, null, upwhere5, 1);

                                    if (accDtInsert.suc == 0){
                                        var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${accDtInsert.msg} \n`;
                                        txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Error while updating account details for account_number: ${dt.account_number}. \n`
                                        WriteLogFile(txt);
                                    }
                                }else{
                                    var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${res_dt.msg} \n`;
                                    txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Error while inserting collection details for receipt_no: ${dt.local_txn_no}. \n`
                                    WriteLogFile(txt);
                                    errInsertColl.push(dt)
                                }
                            }catch(err){
                                errInsertColl.push(dt)
                            }
                        }
                    }else{
                        var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Collection is not ended for agent_trans_no: ${jsonData.agent_trans_no}. \n`
                        WriteLogFile(txt);
                    }
                }else{
                    var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : No data found in md_agent_trans for agent_trans_no: ${jsonData.agent_trans_no}. \n`
                    WriteLogFile(txt);
                }
            }else{
                var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : ${chkTransNo.msg}. \n`;
                txt = txt + `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : Error while fetching the data from md_agent_trans. \n`
                WriteLogFile(txt);
            }
        }else{
            var txt = `[${dateFormat(new Date(), "dd-mmm-yy HH:MM:ss")}] : No Collection details found. \n`
            WriteLogFile(txt);
        }
        return false;
    }catch(err){

    }
    // Await your actual database logic here
    return true;
}

async function startWatcher() {
    // 1. Ensure directories exist
    await fs.mkdir(TARGET_DIR, { recursive: true });
    await fs.mkdir(ARCHIVE_DIR, { recursive: true });

    // 2. Initialize the watcher
    const watcher = chokidar.watch(TARGET_DIR, {
        ignored: /(^|[\/\\])\../, // Ignore hidden dotfiles
        persistent: true,         // Keep the process running 24/7
        depth: 0,                 // Only watch the root of this specific folder

        // CRITICAL SETTING: 
        // This prevents the script from trying to read the file while the operating 
        // system is still in the middle of writing it to the disk.
        awaitWriteFinish: {
            stabilityThreshold: 500, // Wait 500ms after the file size stops changing
            pollInterval: 100        // Check the file size every 100ms
        }
    });

    console.log(`[🟢 Active] Watching for new files instantly in: ${TARGET_DIR}`);

    // 3. Listen for the 'add' event (triggered the millisecond a file arrives)
    watcher.on('add', async (filePath) => {
        // Ignore anything that isn't a JSON file
        if (!filePath.endsWith('.json')) return;

        const fileName = path.basename(filePath);
        const archivePath = path.join(ARCHIVE_DIR, fileName);

        console.log(`\n[⚡ Event] New file detected: ${fileName}`);

        try {
            // Read and parse the file
            const fileData = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(fileData);

            // Insert into the database
            await insertIntoDatabase(jsonData);

            // Move the file to the archive folder so we don't process it again
            await fs.rename(filePath, archivePath);

            console.log(`[✅ Success] Processed and archived: ${fileName}`);

        } catch (error) {
            console.error(`[❌ Error] Failed to process ${fileName}:`, error.message);
            // Optional: You could move failed files to an 'error_files' folder here
        }
    });

    // Handle internal watcher errors
    watcher.on('error', error => console.error(`[Watcher Error]: ${error}`));
}

// Start the watcher
startWatcher();