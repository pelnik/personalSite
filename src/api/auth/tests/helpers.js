const request = require('supertest');
const app = require('../../../../tests/support/apiApp');

const api = () => request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { api, auth };
