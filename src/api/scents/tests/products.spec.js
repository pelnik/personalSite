const { api, auth, login, adminToken } = require('./helpers');

describe('/api/scents/products', () => {
  it('lists products', async () => {
    const res = await api().get('/api/scents/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          name: 'Blue Jasmine',
          description: 'Floral and green',
          price: '$10.99',
          pic_url: '/Media/Candle 1.jpg',
          size: 'S',
          inventory: 3,
          category_id: 1,
          color: 'Blue',
          fragrance: 'Jasmine',
          stripe_product_id: 'prod_fixture_1',
          stripe_price_id: 'price_fixture_1',
        },
      ])
    );
  });

  it('gets one product by id', async () => {
    const { body } = await api().get('/api/scents/products');
    const { id } = body.products.find((p) => p.name === 'Cedar Smoke');

    const res = await api().get(`/api/scents/products/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.product).toMatchObject({ id, name: 'Cedar Smoke', price: '$24.50' });
  });

  it('reports a product that does not exist', async () => {
    const res = await api().get('/api/scents/products/999999');

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('ProductDoesNotExist');
  });

  describe('admin actions', () => {
    it('creates, updates and deletes a product', async () => {
      const token = await adminToken();

      const created = await api()
        .post('/api/scents/products')
        .set(auth(token))
        .send({
          name: 'Test Candle',
          description: 'For testing',
          price: '$12.00',
          pic_url: 'https://example.com/candle.jpg',
          size: 'M',
          inventory: 4,
          category_id: 1,
          color: 'Red',
          fragrance: 'Cherry',
        });

      expect(created.status).toBe(200);
      expect(created.body.product).toMatchObject({
        name: 'Test Candle',
        price: '$12.00',
        stripe_product_id: expect.stringMatching(/^prod_test_/),
        stripe_price_id: expect.stringMatching(/^price_test_/),
      });
      const { id } = created.body.product;

      const updated = await api()
        .patch(`/api/scents/products/${id}`)
        .set(auth(token))
        .send({
          name: 'Test Candle',
          description: 'Updated description',
          price: '$13.00',
          pic_url: 'https://example.com/candle.jpg',
          inventory: 9,
        });

      expect(updated.status).toBe(200);
      expect(updated.body.product).toMatchObject({
        id,
        description: 'Updated description',
        price: '$13.00',
        inventory: 9,
      });

      // #32: missing fields used to be written as NULL, so this failed.
      const partial = await api()
        .patch(`/api/scents/products/${id}`)
        .set(auth(token))
        .send({ inventory: 1 });

      expect(partial.status).toBe(200);
      expect(partial.body.product).toMatchObject({
        id,
        name: 'Test Candle',
        description: 'Updated description',
        price: '$13.00',
        inventory: 1,
      });

      const deleted = await api().delete(`/api/scents/products/${id}`).set(auth(token));

      expect(deleted.status).toBe(200);
      expect(deleted.body).toEqual({ success: true, message: 'You deleted a product.' });

      const gone = await api().get(`/api/scents/products/${id}`);
      expect(gone.body.name).toBe('ProductDoesNotExist');
    });

    it('rejects a duplicate name and size', async () => {
      const res = await api()
        .post('/api/scents/products')
        .set(auth(await adminToken()))
        .send({ name: 'Blue Jasmine', size: 'S' });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('ProductAlreadyExist');
    });

    it('refuses a non-admin', async () => {
      const token = await login('glamgal', 'iloveglam');

      const res = await api()
        .post('/api/scents/products')
        .set(auth(token))
        .send({ name: 'Sneaky', size: 'S' });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('MissingAdminUserError');
    });
  });
});

describe('/api/scents/categories', () => {
  it('lists categories', async () => {
    const res = await api().get('/api/scents/categories');

    expect(res.status).toBe(200);
    expect(res.body.categories).toEqual(
      expect.arrayContaining([
        { id: expect.any(Number), category_name: 'Candle' },
        { id: expect.any(Number), category_name: 'Diffuser' },
      ])
    );
  });

  it('lets an admin create a category', async () => {
    const res = await api()
      .post('/api/scents/categories')
      .set(auth(await adminToken()))
      .send({ category_name: `Category ${Date.now()}` });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, category: { id: expect.any(Number) } });
  });

  it('requires a category name', async () => {
    const res = await api()
      .post('/api/scents/categories')
      .set(auth(await adminToken()))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('MustIncludeCategoryName');
  });

  it('rejects a duplicate category name', async () => {
    const res = await api()
      .post('/api/scents/categories')
      .set(auth(await adminToken()))
      .send({ category_name: 'Candle' });

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('Error creating category');
  });
});

describe('/api/scents/health', () => {
  it('responds', async () => {
    const res = await api().get('/api/scents/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'All is well' });
  });
});
