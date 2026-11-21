// Loaded before every API test file and by each global setup. Values set here
// win over .env, because dotenv never overrides variables that already exist.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.GITHUB_WEBHOOK = 'test-webhook-secret';

// Never let tests reach a real Stripe account. The scents project also maps the
// stripe package to a stub, so this key is never actually used.
process.env.STRIPE_KEY = 'sk_test_stub';

require('dotenv').config();
