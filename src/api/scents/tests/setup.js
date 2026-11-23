require('../../../../tests/support/testEnv');
const { ensureTestDatabases } = require('../../../../tests/support/testDatabases');

// The real seed creates 100 users and 100 products and calls Stripe for every
// product. Tests only need the schema plus a small, known fixture set, so this
// builds the tables from the seed and inserts fixtures directly.
const setup = async () => {
  await ensureTestDatabases();

  // Global setup runs outside Jest's module registry, so moduleNameMapper
  // doesn't apply: requiring the seed loads the real stripe package. Nothing
  // here calls Stripe, and this check makes sure a real key can't be present.
  if (process.env.STRIPE_KEY !== 'sk_test_stub') {
    throw new Error('STRIPE_KEY must be the test stub key during scents test setup');
  }

  const client = require('../db/client');
  const { dropTables, createTables } = require('../db/seed');
  const { createUser, createCategory } = require('../db');

  await dropTables();
  await createTables();

  await createUser({
    username: 'sandra',
    password: 'sandra123',
    name: 'sandra',
    email: 'sandra@email.com',
    is_admin: true,
  });
  await createUser({
    username: 'glamgal',
    password: 'iloveglam',
    name: 'Joshua',
    email: 'joshua@email.com',
  });

  await createCategory({ category_name: 'Candle' });
  await createCategory({ category_name: 'Diffuser' });

  // Inserted directly, because createProduct() creates a Stripe product first.
  await client.query(`
    INSERT INTO products(name, description, price, pic_url, size, inventory, category_id, color, fragrance, stripe_product_id, stripe_price_id)
    VALUES
      ('Blue Jasmine', 'Floral and green', '$10.99', '/Media/Candle 1.jpg', 'S', 3, 1, 'Blue', 'Jasmine', 'prod_fixture_1', 'price_fixture_1'),
      ('Cedar Smoke', 'Warm and woody', '$24.50', '/Media/Candle 2.jpg', 'L', 5, 1, 'Brown', 'Cedar', 'prod_fixture_2', 'price_fixture_2'),
      ('Sea Breeze', 'Fresh and salty', '$15.00', '/Media/Diffuser 1.jpg', 'M', 2, 2, 'White', 'Ocean', 'prod_fixture_3', 'price_fixture_3');
  `);

  await client.end();
};

module.exports = setup;
