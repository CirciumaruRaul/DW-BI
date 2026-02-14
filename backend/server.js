const express = require('express')
const oracle = require('oracledb')
const app = express()
const port = 3001
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
  try {
    string = await connection.execute(req.body.query);
    console.log('Query executed successfully. Closing connection...');
    res.status(200).json({ message: string.rows });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ message: 'Error executing query' });
  }
   finally {
    connection.close();
  }
});

app.post('/dw', async (req, res) => {
  const connection = await connect(dw_user);
  try {
    string = await connection.execute(req.body.query);
    res.json(string.rows);
    console.log('Query executed successfully. Closing connection...');
    res.status(200).json({ message: string.rows });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ message: 'Error executing query' });
  } finally {    
    connection.close();
  }
});

app.get('/sync', async (req, res) => {
  const connection = await connect(dw_user);
  try {
    for (const query of sync_query) {
      string = await connection.execute(query);
    }
    res.status(200).json({ message: 'Sync query executed successfully' });
    console.log('Sync query executed successfully. Closing connection...');
  } catch (err) {
    console.error('Error executing sync query:', err);
    res.status(500).json({ message: 'Error executing sync query' });
  } finally {
    connection.close();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});