/** Database setup for BizTime. */
// Note - My system had a bit of trouble connecting. I have 2 methods here and both had different ways of resolving.

const { Client } = require("pg");

const client = new Client({connectionString: "postgresql:///biztime"});

client.connect();

module.exports = client;

// const { Client } = require('pg');

// let DB_URI;
// if (process.env.NODE_ENV === "test") {
//   DB_URI = "biztime_test"
// } else {
//   DB_URI = "biztime"
// }

// // These are default credentials that should be replaced 
// const db = new Client({
//   user: 'dbz685',
//   host: 'localhost',
//   password: 'abc123',
//   database: DB_URI,
//   port: 3000, 
// });

// // Connect to the database
// db.connect()
//   .then(() => console.log('Connected to PostgreSQL database'))
//   .catch(err => console.error('Error connecting to PostgreSQL database', err));

// module.exports = db