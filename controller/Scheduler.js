const { db_Insert, db_Select } = require("../model/MasterModule");
const dateFormat = require('dateformat');


const calDate = (nowDate, addDate) => {
    const initialDate = new Date(nowDate);
    const newDate = new Date(initialDate);
    // return newDate.setDate(initialDate.getDate() + (addDate-1))
    return newDate.setDate(initialDate.getDate() + (addDate))
}
const update_endcollection = async () => {
    try {

        let select = 'b.bank_id ,b.branch_code ,b.agent_code,b.send_date,b.sl_no,a.allow_collection_days ',
            table_name = 'md_agent AS a, md_agent_trans AS b',
            whr = `a.bank_id = b.bank_id AND a.branch_code=b.branch_code AND a.agent_code = b.agent_code AND b.coll_flag='Y' AND b.end_flag='N'`;
        const get_activeagent = await db_Select(select, table_name, whr, null);

        for (let ldata of get_activeagent.msg) {
            ldata.allow_collection_days;
            ldata.send_date;



            const nowdate = dateFormat(new Date(), "yyyy-mm-dd")
            const thisdata = dateFormat(calDate(ldata.send_date, ldata.allow_collection_days), "yyyy-mm-dd")
            // console.log(thisdata)
            if (nowdate > thisdata) {
                let transDate = ((ldata.agent_code).toString() + (ldata.sl_no).toString()).toString()

                let dbvalers = `agent_trans_no=${transDate}`,
                    dbwhere = `bank_id='${ldata.bank_id}'AND branch_code='${ldata.branch_code}'AND agent_code='${ldata.agent_code}' AND agent_trans_no IS NULL`;
                let update_res = await db_Insert("td_collection", dbvalers, null, dbwhere, 1);

                if (update_res.suc > 0) {
                    let fields = `agent_trans_no ='${transDate}', coll_flag='N', received_date='${dateFormat(new Date(), "yyyy-mm-dd")}', end_flag='Y'`,
                        wherre = `bank_id=${ldata.bank_id} AND branch_code='${ldata.branch_code}' AND agent_code='${ldata.agent_code}' AND coll_flag='Y' AND end_flag='N' AND agent_trans_no IS NULL`;
                    let res_dt = await db_Insert("md_agent_trans", fields, null, wherre, 1);

                }
            }
        }

    } catch (error) {
        // console.log(error)
    }
}

module.exports = { update_endcollection }