module.exports = {
  ...require('./middleware'),
  signToken: require('./tokens').signToken,
  createAccount: require('./db').createAccount,
  authenticateAccount: require('./db').authenticateAccount,
  getAccountByUsername: require('./db').getAccountByUsername,
  createAuthTables: require('./db').createAuthTables,
  seedAccounts: require('./db').seedAccounts,
};
