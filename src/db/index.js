const { Client } = require('pg');
const { DATABASE_URL } = process.env;
const client = new Client(DATABASE_URL);
