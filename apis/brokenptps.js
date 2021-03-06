var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('../dbconfig.js');

const router = express.Router();

function doRelease(connection) {
    connection.close(
        function (err) {
            if (err)
                console.error(err.message);
        });
}

router.get("/all", (req, res, next) => {
    let offset = req.query.offset;
    let rows = req.query.rows;

    if(offset == undefined || rows == undefined) {
        offset = 0;
        rows = 20;
    }

    var sql = "select p.accnumber, p.ptpamount, p.actiondate, p.ptpdate, p.paymethod, p.met from ptps p join tqall t on p.accnumber=t.accnumber offset "+offset+" rows fetch next "+rows+" rows only";
    var total = 0;
    (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
      
          result = await connection.execute("select count(*) total from ptps p join tqall t on p.accnumber=t.accnumber where p.met !='met'");
          data = await connection.execute(sql);
          //
          total = result.rows[0].TOTAL;
          res.status(200).json({
            message: "success",
            totalRecords: total,
            data: data.rows
        });
      
        } catch (err) {
          console.error(err);
        } finally {
          if (connection) {
            try {
              await connection.close();   // Always close connections
            } catch (err) {
              console.error(err.message);
            }
          }
        }
      })();
});

router.get("/all_search", (req, res, next) => {
    let offset = req.query.offset;
    let rows = req.query.rows;
    let searchtext = req.query.searchtext;

    if(offset == undefined || rows == undefined || searchtext == undefined) {
        offset = 0;
        rows = 20;
        searchtext = ''
    }

    var sql = "select * from tqall where settleaccbal > 1000 and upper(accnumber||custnumber||client_name||arocode||colofficer) like '%"+searchtext.toUpperCase() +"%' offset "+offset+" rows fetch next "+rows+" rows only";
    var total = 0;
    (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
      
          result = await connection.execute("select count(*) total from tqall where settleaccbal > 1000 and upper(accnumber||custnumber||client_name||arocode||colofficer) like '%"+searchtext.toUpperCase() +"%'");
          data = await connection.execute(sql);
          //
          total = result.rows[0].TOTAL;
          res.status(200).json({
            message: "success",
            totalRecords: total,
            data: data.rows
        });
      
        } catch (err) {
          console.error(err);
        } finally {
          if (connection) {
            try {
              await connection.close();   // Always close connections
            } catch (err) {
              console.error(err.message);
            }
          }
        }
      })();
});

module.exports = router;