// CONNECTION STRING FOR ORACLE DB
module.exports = {
  1: {
    user: "bccs",
    password: "bccs21101",
    // connectionString: "103.177.225.252:1521/xe",
    connectionString: "synergic-db1.ckoqkwog5p58.ap-south-1.rds.amazonaws.com:1521/syndb1",
    poolMax: 5,
    poolMin: 5,
    poolIncrement: 0,
  },
  2: {
    user: "puri_cbs",
    password: "puri_cbs161101",
    // connectionString: "103.177.225.252:1521/xe",
    connectionString: "202.65.156.246:1521/orcl",
    poolMax: 5,
    poolMin: 5,
    poolIncrement: 0,
  },
  3: {
    user: "puri_app",
    password: "puri_cbs161101",
    // connectionString: "103.177.225.252:1521/xe",
    connectionString: "202.65.156.246:1521/orcl",
    poolMax: 5,
    poolMin: 5,
    poolIncrement: 0,
  },
  4: {
    user: "spcbs",
    password: "spcbs191101",
    // connectionString: "103.177.225.252:1521/xe",
    connectionString: "synergic-db1.ckoqkwog5p58.ap-south-1.rds.amazonaws.com:1521/syndb1",
    poolMax: 5,
    poolMin: 5,
    poolIncrement: 0,
  },
};