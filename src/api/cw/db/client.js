require('dotenv').config();
const { createPool } = require('../../createPool');
module.exports = createPool('cw', process.env.CW_DATABASE_URL);
