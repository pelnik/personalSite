module.exports = {
  client: require('./client'),
  ...require('./schema'),
  ...require('./accounts'),
  ...require('./seedAccounts'),
  ...require('./seed'),
};
