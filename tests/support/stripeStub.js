// Stand-in for the `stripe` package inside API test files (wired up through
// moduleNameMapper in jest.config.js), so no test ever reaches Stripe.
// Global setup files don't go through moduleNameMapper; see testEnv.js.
let counter = 0;
const nextId = (prefix) => `${prefix}_test_${++counter}`;

function stripeStub() {
  return {
    products: {
      list: async () => ({ data: [] }),
      create: async () => ({ id: nextId('prod') }),
      update: async (id) => ({ id }),
    },
    prices: {
      list: async () => ({ data: [] }),
      create: async () => ({ id: nextId('price') }),
      update: async (id) => ({ id }),
    },
    paymentIntents: {
      create: async ({ amount }) => ({
        amount,
        client_secret: `pi_test_${amount}_secret`,
      }),
    },
  };
}

module.exports = stripeStub;
