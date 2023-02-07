var db = require('../database');

// Returns the last fetched block for a address or create new if not exist
const getLatestBlock = async (address) => {
    let latestBlock = 0;
    db.getLatestBlock(address, function(row) {
        if (row) {
            latestBlock = row.blockNumber;
        } else {
            db.insertLastFetchedBlock(address, latestBlock);
        }
    });
    return latestBlock;
}

// update the Last fetched block for given address
const updateLatestBlock = async (address, latestBlock) => {
    db.updateLatestBlock(address, latestBlock);
}

// Importing express module
const express=require("express");
const { ethers } = require('ethers');
const router=express.Router()
const fetch = require('node-fetch');
  
// Handling request using router
router.get("/fetch",(req,res,next) => {
    // Getting the account address from the request
    const accAddr = req.query.accAddr;
    // Getting the transaction from the database
    db.getTransaction(accAddr, function(row) {
        // If the transaction is found
        if (row) {
            // Delete the transaction from the database
            db.deleteTransaction(accAddr);
            // Send the transaction to the client
            res.send(row.txn);
        } else {
            res.send("None");
        }
    });
})

// Handeling get user transaction 
router.get("/getTransactionHistory",async (req, res, next) => {
    // Get address from the query
    const address = req.query.address;
    let latestBlock = await getLatestBlock(address);
    const ABI = ['function approve(address spender, uint256 amount) external returns (bool)'];
    const iface = new ethers.utils.Interface(ABI);
    const api = "6AH3WKE7UZ19M46GGAQJAK82YUC9H6VYZB"
    const url = `https://api-goerli.etherscan.io/api ?module=account&action=txlist&address=${address}&startblock=${latestBlock}&endblock=99999999&page=1&offset=1000&sort=dec&apikey=${api}}`;

    const data = await fetch(url).then((response)=> {
        return response.json()
    }).then((data) => {
        return data.result;
    }).catch((err) => {
        console.log(err);
    })

    var transactions = [];

    data.forEach(async(element) => {
        const funcName = element.functionName.slice(0, 7);
        if (funcName == "approve") {
            if(latestBlock < element.blockNumber) {
                latestBlock = element.blockNumber
            }
            const decodedData = iface.parseTransaction({data: element.input, value: element.value});
            transactions.push([ element.to, decodedData.args.spender]);
        }
    });
    updateLatestBlock(address, latestBlock);
    res.send(transactions);
})
  
// Importing the router
module.exports = router
