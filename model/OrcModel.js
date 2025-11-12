// VARIABLE & MODULE INITIALIZATION
const db_details = require("../config/conString"),
  oracledb = require("oracledb");
// const db = require("./dbcon");
try {
  // oracledb.initOracleClient({
  //   libDir: "C:\\instaclient\\instantclient",
  // });
    oracledb.initOracleClient({ libDir: "C:\\instantclient_11_2"});
} catch (err) {
  console.error("Whoops!");
  console.error(err);
  process.exit(1);
}
//oracledb.initOracleClient({ libDir: 'C:\\instantclient\\instantclient_18_5' });
oracledb.autoCommit = true;
// END

// FUNCTION FOR EXICUTE SELECT QUERY AND RETURN RESULT
const F_Select = (db_id, fields, table_name, where, order, flag, full_query = null) => {
    return new Promise(async (resolve, reject) => {
        where = where ? `WHERE ${where}` : '';
        order = order ? order : '';
        // console.log(dbString);

        // CREATE DB CONNECTION
        const pool = await oracledb.createPool(db_details[db_id]);
        const con = await pool.getConnection();
        // END
        // SQL QUERY
        let sql = `SELECT ${fields} FROM ${table_name} ${where} ${order}`
        // console.log(sql);

       try {
             // EXICUTE QUERY
            const result = await con.execute(full_query ? full_query : sql, [], {
                resultSet: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });
            // END
            // STORE RESULT SET IN A VARIABLE
            let rs = result.resultSet
            // console.log(rs);

            // RETURN RESULT SET AS USER'S REQUIREMENT
            var data = flag > 0 ? await rs.getRows() : await rs.getRow(); // 0-> Single DataSet; 1-> Multiple DataSet
            // console.log(await rs.getRows());
            // CLOSE CONNECTION
            await con.close();
            await pool.close();
            // END
            data = flag > 0 ? (data.length > 0 ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' }) : (data ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' })
            resolve(data);
            // END
       }catch (err){
            console.log(err);
            await con.close();
            await pool.close();
            resolve({suc:0, msg:err});
       }
       
    })
}

// FUNCTION FOR INSERT DATA TO DATABASE
const F_Insert = (db_id,table_name, fields, val, values, where, flag) => {
    return new Promise(async (resolve, reject) => {
        // CREATE DB CONNECTION
        const pool = await oracledb.createPool(db_details[db_id]);
        const con = await pool.getConnection();
        // END

        // SQL QUERY
        const sql = flag > 0 ? `UPDATE "${table_name}" SET ${fields} WHERE ${where}` :
            `INSERT INTO "${table_name}" (${fields}) VALUES (${val})`; // 0-> INSERT NEW DATA; 1-> UPDATE TABLE DATA
        console.log(sql);
        console.log(values);

        try {
            // EXICUTE QUERY AND RETURN RESULT
            if (await con.execute(sql, values, { autoCommit: true })) {
                res_data = { suc: 1, msg: 'success' }
            } else {
                res_data = { suc: 0, msg: 'err' }
            }
            await con.close();
            await pool.close();
            // const res = await con.execute(`SELECT * FROM "${table_name}"`);
            resolve(res_data)
        } catch (err) {
            console.log(err);
            await con.close();
            await pool.close();
            resolve({ suc: 0, msg: err })
        }
        //END
    })
}

const F_Insert_Puri = (db_id, table_name, fields, val, values, where, flag) => {
  return new Promise(async (resolve, reject) => {
      // CREATE DB CONNECTION
      const pool = await oracledb.createPool(db_details[db_id]);
      const con = await pool.getConnection();
      // END

      // SQL QUERY
      const sql = flag > 0 ? `UPDATE "${table_name}" SET ${fields} WHERE ${where}` :
          `INSERT INTO "${table_name}" ${fields} VALUES (:0, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15, :16, :17, :18, :19, :20, :21, :22, :23, :24, :25, :26, :27, :28, :29, :30)`; // 0-> INSERT NEW DATA; 1-> UPDATE TABLE DATA
      // console.log(sql);

      try {
          // EXICUTE QUERY AND RETURN RESULT
          if (await con.execute(sql, values, { autoCommit: true })) {
              res_data = { suc: 1, msg: 'success' }
          } else {
              res_data = { suc: 0, msg: 'err' }
          }
          // const res = await con.execute(`SELECT * FROM "${table_name}"`);
          resolve(res_data)
      } catch (err) {
          console.log(err);
          resolve({ suc: 0, msg: err })
      }
      // await con.execute(sql, async (err, result) => {
      //     if (err) {
      //         console.log(err);
      //         res_data = { suc: 0, msg: err }
      //     } else {
      //         res_data = { suc: 1, msg: result }
      //     }
      //     await con.close();
      //     resolve(res_data)
      // });
      //END
  })
}

const RunProcedure = (db_id, pro_query, table_name, fields, where, order) => {
  return new Promise(async (resolve, reject) => {
      where = where ? `WHERE ${where}` : '';
      order = order ? order : '';

      const pool = await oracledb.createPool(db_details[db_id]);
      const con = await pool.getConnection();
      try{
        //pro_query = "";
        await con.execute(`ALTER SESSION SET NLS_DATE_FORMAT = 'DD/MM/YYYY'`);
        let query = pro_query;//`DECLARE AD_ACC_TYPE_CD NUMBER; AS_ACC_NUM VARCHAR2(200); ADT_FROM_DT DATE; ADT_TO_DT DATE; BEGIN AD_ACC_TYPE_CD := 6; AS_ACC_NUM := '1044100002338'; ADT_FROM_DT := to_date(to_char('20-Oct-2021')); ADT_TO_DT := to_date(to_char('20-Oct-2022')); P_ACC_STMT( AD_ACC_TYPE_CD => AD_ACC_TYPE_CD, AS_ACC_NUM => AS_ACC_NUM, ADT_FROM_DT => ADT_FROM_DT, ADT_TO_DT => ADT_TO_DT ); END;`;
        await con.execute(query);
        const r = await con.execute(`SELECT ${fields} FROM ${table_name} ${where} ${order}`, [], {
            resultSet: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
    
        let rs = r.resultSet
        //   // console.log({rs});
        var data = await rs.getRows();
        //   // console.log({data});
        await con.close();
        await pool.close();
        resolve(data);
      }catch(err){
        await con.close();
        await pool.close();
        resolve({ suc: 0, msg: err })
      }
  })
}

const Api_Insert= (db_id, table_name, fields, fieldIndex, values, where, flag) => {
return new Promise(async (resolve, reject) => {
      // CREATE DB CONNECTION
      const pool = await oracledb.createPool(db_details[db_id]);
      const con = await pool.getConnection();
      // END

      // SQL QUERY
      const sql = flag > 0 ? `UPDATE "${table_name}" SET ${fields} WHERE ${where}` :
          `INSERT INTO "${table_name}" (${fields}) VALUES ${fieldIndex}`; // 0-> INSERT NEW DATA; 1-> UPDATE TABLE DATA
      console.log(sql, values);

      try {
          // EXICUTE QUERY AND RETURN RESULT
          if (await con.execute(sql, values, { autoCommit: true })) {
              res_data = { suc: 1, msg: 'success' };
          } else {
              res_data = { suc: 0, msg: 'err' };
          }
    await con.close();
        await pool.close();
          // const res = await con.execute(`SELECT * FROM "${table_name}"`);
          resolve(res_data)
      } catch (err) {
          console.log(err);
    await con.close();
        await pool.close();
          resolve({ suc: 0, msg: err })
      }
      //END
  })
}

const SendNotification = () => {
    var db_id = 5,
    flag = 1;
    return new Promise(async (resolve, reject) => {
        // CREATE DB CONNECTION
        const pool = await oracledb.createPool(db_details[db_id]);
        const con = await pool.getConnection();
        // await con.release();
        // END
        // SQL QUERY
        let sql = `SELECT SL_NO, NARRATION, SEND_USER_ID, VIEW_FLAG, CREATED_DT FROM td_notification order by sl_no desc`
        console.log(sql);
  
        // EXICUTE QUERY
        const result = await con.execute(sql, [], {
            resultSet: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
        // END
  
        // STORE RESULT SET IN A VARIABLE
        let rs = result.resultSet
        // console.log(rs);
  
        // RETURN RESULT SET AS USER'S REQUIREMENT
        var data = await rs.getRows(); // 0-> Single DataSet; 1-> Multiple DataSet
        // console.log(await rs.getRows());
        // END
  
        // CLOSE CONNECTION
        // await con.release();
        await con.close();
        await pool.close();
        // END
    data = flag > 0 ? (data.length > 0 ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' }) : (data ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' })
        resolve(data);
    })
}

const F_Delete = (db_id, table_name, where) => {
    return new Promise(async (resolve, reject) => {
        // CREATE DB CONNECTION
        const pool = await oracledb.createPool(db_details[db_id]);
        const con = await pool.getConnection();
        // END

        // SQL QUERY
        const sql = `DELETE FROM ${table_name} WHERE ${where}`;
        console.log(sql);

        const result = await con.execute(sql, [], {
            resultSet: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
        // END
        console.log(result);
        // STORE RESULT SET IN A VARIABLE
        let rs = result.rowsAffected
        // console.log(rs);
  
        // CLOSE CONNECTION
        // await con.release();
        await con.close();
        await pool.close();
        // END
        data = rs > 0 ? { suc: 1, msg: 'Deleted Successfully' } : { suc: 0, msg: 'Error in deletion' }
        resolve(data);
      //END
    })
}


const F_insert_bulk_data=(db_id,binds)=>{
    return new Promise(async (resolve, reject) => {
         // CREATE DB CONNECTION
      const pool = await oracledb.createPool(db_details[db_id]);
      const con = await pool.getConnection();
      // END

       // SQL QUERY
        const sql = `INSERT INTO TD_COLLECTION (receipt_no, agent_trans_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number, account_holder_name, deposit_amount, download_flag, collection_by, collected_at) VALUES(:a, :b, :c, :d, :e, :f, :g, :h, :i, :j, :k,:l,:m,:n)`;
        const options = {
            batchErrors: false,
            // bindDefs: [
            //     { type: oracledb.NUMBER },
            //     { type: oracledb.STRING },
            //     { type: oracledb.NUMBER },
            //     { type: oracledb.STRING },
            //     { type: oracledb.STRING },
            //     { type: oracledb.DATE },
            //     { type: oracledb.STRING },
            //     { type: oracledb.STRING },
            //     { type: oracledb.STRING },
            //     { type: oracledb.STRING },
            //     { type: oracledb.NUMBER },
            //     { type: oracledb.STRING },
            //     { type: oracledb.NUMBER },
            //     { type: oracledb.DATE }
            // ]
        };
       
        try {
            // EXICUTE QUERY AND RETURN RESULT
            if (await con.executeMany(sql, binds, options)) {
                res_data = { suc: 1, msg: 'success' };
            } else {
                res_data = { suc: 0, msg: 'err' };
            }
            await con.close();
            await pool.close();
            resolve(res_data)
        } catch (err) {
            console.log(err);
            await con.close();
            await pool.close();
            resolve({ suc: 0, msg: err })
        }
    })
}

module.exports = { F_Select, F_Insert, RunProcedure, F_Insert_Puri, Api_Insert, SendNotification, F_Delete,F_insert_bulk_data }
