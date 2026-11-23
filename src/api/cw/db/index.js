module.exports = {
  client: require('./client'),
  ...require('./schema'),
  ...require('./profiles'),
  ...require('./sessions'),
  ...require('./seed'),
};
