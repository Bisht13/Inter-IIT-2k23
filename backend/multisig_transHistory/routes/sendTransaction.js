var db = require('../database');

// Importing the module
const express = require("express")
const router = express.Router()
  
// Handling send request
router.get("/send",(req,res,next) => {
    // Getting the account address from the request
    const accAddr = req.query.accAddr;
    // Getting the transaction from the request
    const txn = req.query.txn;
    // Inserting the transaction into the database
    db.insertTransaction(accAddr, txn);
    res.send("Success");
})

router.post("/sendSafe", (req, res, next) => {
    const safeAddr = req.body.safeAddr;
    const owners = req.body.owners;
    const threshold = req.body.threshold;
    db.insertSafe(safeAddr, owners, threshold);
    res.send("Success");
})

// Importing the router
module.exports = router
