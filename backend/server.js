const express = require('express')
const oracle = require('oracledb')
const app = express()
const port = 3000
const otlp_user = 'app_user_oltp';
const dw_user = 'app_user_dw';
const sync_query = require('./sync').sync_query;
app.use(express.json());

async function connect(username) {
  let connection;
  try {
    console.log(username);
    connection = await oracle.getConnection({
      user: username,
      password: 'password123',
      connectString: 'localhost/XEPDB1'
    })
    console.log('Connected to Oracle Database with user:', username);
    return connection
  } catch (err) {
    console.error('Error connecting to Oracle Database:', err)
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/otlp', async (req, res) => {
  const connection = await connect(otlp_user);
  string = await connection.execute(req.body.query);
  console.log(string.rows);
  res.json(string.rows);
  console.log('Query executed successfully. Closing connection...');
  connection.close();
});

app.post('/dw', async (req, res) => {
  const connection = await connect(dw_user);
  string = await connection.execute(req.body.query);
  // console.log(string.rows);
  res.json(string.rows);
  console.log('Query executed successfully. Closing connection...');
  connection.close();
});

app.get('/sync', async (req, res) => {
  const connection = await connect(dw_user);
  const results = [];
  for (const query of sync_query) {
    string = await connection.execute(query);
  }
  res.send("Data warehouse synchronized successfully.");
  console.log('Sync query executed successfully. Closing connection...');
  connection.close();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});