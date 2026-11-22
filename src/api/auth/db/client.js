require('dotenv').config();
const { createPool } = require('../../createPool');

module.exports = createPool('auth', process.env.AUTH_DATABASE_URL);
