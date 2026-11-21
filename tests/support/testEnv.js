// Loaded before every API test file and by each global setup. Values set here
// win over .env, because dotenv never overrides variables that already exist.
process.env.NODE_ENV = 'test';
// Tests sign their own tokens, so they use a fixed secret rather than the one
// in .env (CI sets its own, which is kept).
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Never let tests reach a real Stripe account. Inside test files the stripe
// package is mapped to a stub (jest.config.js); global setup files load the
// real package, so this dummy key is what protects them.
process.env.STRIPE_KEY = 'sk_test_stub';

require('dotenv').config();
