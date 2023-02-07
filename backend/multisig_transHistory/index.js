var db = require('./database');

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: '*'
}));

app.use(express.json());

const fetchRoute = require('./routes/fetchTransaction');
const sendRoute = require('./routes/sendTransaction');
const testRoute = require('./routes/test');

app.use('/api', fetchRoute);
app.use('/api', sendRoute);
app.use('/api', testRoute);

port = process.env.PORT || 3000;

app.listen(port, () => {
  db.createSafeTable();
  db.createLastFetchedBlockTable();
  // db.createTransactionTable();
  console.log(`Example app listening on port ${port}!`);
});
