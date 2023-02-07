var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('db.sqlite3');

function createSafeTable() {
    db.run("CREATE TABLE IF NOT EXISTS safe (safeAddr TEXT, owners TEXT, threshold TEXT)");
}

function createTransactionTable() {
  db.run("CREATE TABLE IF NOT EXISTS transaction (accAddr TEXT, txn TEXT)");
}

function createLastFetchedBlockTable() {
    db.run("CREATE TABLE IF NOT EXISTS lastFetchedBlock (address TEXT, blockNumber INTEGER)");
}

function insertSafe(safeAddr, owners, threshold) {
  db.run("INSERT INTO safe VALUES (?, ?, ?)", [safeAddr, owners, threshold]);
}

function updateLatestBlock(address, latestBlock) {
    db.run("UPDATE lastFetchedBlock SET blockNumber = ? WHERE address = ?", [latestBlock, address]);
}

function insertLastFetchedBlock(address, latestBlock) {
    db.run("INSERT INTO lastFetchedBlock VALUES (?, ?)", [address, latestBlock]);
}

function insertTransaction(accAddr, txn) {
  db.run("INSERT INTO transaction VALUES (?, ?)", [accAddr, txn]);
}

function getSafe(safeAddr, callback) {
  db.get("SELECT * FROM safe WHERE safeAddr = ?", [safeAddr], function(err, row) {
    if (err) {
      console.log(err);
    } else {
      callback(row);
    }
  });
}

function getTransaction(accAddr, callback) {
    db.get("SELECT txn FROM transaction WHERE accAddr = ?", [accAddr], function(err, row) {
        if (err) {
        console.log(err);
        } else {
        callback(row);
        }
    });
}

function getLatestBlock(address, callback) {
    db.get("SELECT blockNumber FROM lastFetchedBlock WHERE address = ?", [address], function(err, row) {
        if (err) {
            console.log(err);
        } else {
            callback(row);
        }
    });
}

function deleteSafe(safeAddr) {
    db.run("DELETE FROM safe WHERE safeAddr = ?", [safeAddr]);
}

function deleteTransaction(accAddr) {
    db.run("DELETE FROM transaction WHERE accAddr = ?", [accAddr]);
}

module.exports = {
    createSafeTable,
    createTransactionTable,
    createLastFetchedBlockTable,
    insertSafe,
    updateLatestBlock,
    insertLastFetchedBlock,
    insertTransaction,
    getTransaction,
    getLatestBlock,
    deleteSafe,
    deleteTransaction
}

