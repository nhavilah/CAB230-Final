var express = require('express');
const mysql = require('mysql');
var router = express.Router();

/* GET home page. */
// router.get('/stocks', function(req, res, next) {
//   res.render('index', { title: 'Welcome To The Stocks API' });
// });


/*Stocks get companies by industry */
// router.get("/stocks/symbols", async (req,res,next) => {
//   let stocks;
//   try {
//     if(req.query.industry) {
//       stocks = await req.db.from("stocks").select("name","symbol","industry").where('industry','LIKE',req.query.industry+'%').distinct()
//     } else {
//       stocks = await req.db.from("stocks").select("name","symbol","industry").distinct()
//     }
//     console.log(stocks);
//     if(stocks.length){
//       return res.json({stocks})
//     }else{
//       throw
//       return res.status(404),res.json({"error":true,"message":"Industry sector not found"})
//     }
//   } catch(error) {
//     console.log(error);
//     res.json({"error":true,"message":"Industry sector not found"})
//   }
// });


module.exports = router;