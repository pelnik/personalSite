// The e2e seed requires this, and the server preloads it with node --require.
require('dotenv').config();
require('../support/localDatabases')();
require('../support/testDatabases').useTestDatabases('e2e');
