const jwt = require('jsonwebtoken');
const { api, auth, adminToken, registerUser } = require('./helpers');

async function productIds() {
  const { body } = await api().get('/api/scents/products');
  const byName = Object.fromEntries(body.products.map((p) => [p.name, p.id]));
  return { jasmine: byName['Blue Jasmine'], cedar: byName['Cedar Smoke'] };
}

const getCart = async (token) =>
  (await api().get('/api/scents/cart_products').set(auth(token))).body.cart;

describe('/api/scents/cart_products', () => {
  it('starts a new user with an empty active cart', async () => {
    const user = await registerUser();

    const res = await api().get('/api/scents/cart_products').set(auth(user.token));

    expect(res.status).toBe(200);
    expect(res.body.cart).toMatchObject({
      id: expect.any(Number),
      user_id: user.id,
      is_active: true,
      status: 'Created',
      items: [],
    });
  });

  it('adds, updates and removes a cart item', async () => {
    const user = await registerUser();
    const { jasmine } = await productIds();

    const added = await api()
      .post(`/api/scents/cart_products/${jasmine}`)
      .set(auth(user.token))
      .send({ quantity: 2 });

    expect(added.status).toBe(200);
    expect(added.body.item).toMatchObject({ product_id: jasmine, quantity: 2 });

    const cart = await getCart(user.token);
    expect(cart.items).toEqual([
      expect.objectContaining({
        product_id: jasmine,
        quantity: 2,
        product_name: 'Blue Jasmine',
        product_price: '$10.99',
        category_name: 'Candle',
      }),
    ]);
    const cartProductId = cart.items[0].id;

    const updated = await api()
      .patch(`/api/scents/cart_products/${cartProductId}`)
      .set(auth(user.token))
      .send({ quantity: 5 });

    expect(updated.status).toBe(200);
    expect(updated.body.item).toMatchObject({ id: cartProductId, quantity: 5 });

    const removed = await api()
      .delete(`/api/scents/cart_products/${cartProductId}`)
      .set(auth(user.token));

    expect(removed.status).toBe(200);
    expect(removed.body.cartItem).toMatchObject({ id: cartProductId });
    expect((await getCart(user.token)).items).toEqual([]);
  });

  it('rejects an invalid quantity', async () => {
    const user = await registerUser();
    const { jasmine } = await productIds();
    await api()
      .post(`/api/scents/cart_products/${jasmine}`)
      .set(auth(user.token))
      .send({ quantity: 1 });
    const [item] = (await getCart(user.token)).items;

    const notNumber = await api()
      .patch(`/api/scents/cart_products/${item.id}`)
      .set(auth(user.token))
      .send({ quantity: '3' });
    const tooSmall = await api()
      .patch(`/api/scents/cart_products/${item.id}`)
      .set(auth(user.token))
      .send({ quantity: 0 });

    expect(notNumber.body.name).toBe('InvalidQuantityDataType');
    expect(tooSmall.body.name).toBe('InvalidQuantityValue');
  });

  it("refuses to change someone else's cart item", async () => {
    const owner = await registerUser();
    const other = await registerUser();
    const { jasmine } = await productIds();
    await api()
      .post(`/api/scents/cart_products/${jasmine}`)
      .set(auth(owner.token))
      .send({ quantity: 1 });
    const [item] = (await getCart(owner.token)).items;

    const patch = await api()
      .patch(`/api/scents/cart_products/${item.id}`)
      .set(auth(other.token))
      .send({ quantity: 2 });
    const remove = await api()
      .delete(`/api/scents/cart_products/${item.id}`)
      .set(auth(other.token));

    expect(patch.body.name).toBe('WrongUser');
    expect(remove.body.name).toBe('WrongCartProductDelete');
  });

  it('rejects adding the same product twice', async () => {
    const user = await registerUser();
    const { jasmine } = await productIds();
    const add = () =>
      api()
        .post(`/api/scents/cart_products/${jasmine}`)
        .set(auth(user.token))
        .send({ quantity: 1 });

    await add();
    const res = await add();

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('InvalidProductId');
  });

  // KNOWN BUG: POST and PATCH skip requireUser, so a logged-out request
  // crashes on req.user.id instead of returning MissingUserError.
  it('KNOWN BUG: logged-out add-to-cart fails with a TypeError', async () => {
    const { jasmine } = await productIds();

    const res = await api()
      .post(`/api/scents/cart_products/${jasmine}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('TypeError');
  });
});

describe('/api/scents/carts', () => {
  it('checks out the active cart and opens a new one', async () => {
    const user = await registerUser();
    const { jasmine } = await productIds();
    await api()
      .post(`/api/scents/cart_products/${jasmine}`)
      .set(auth(user.token))
      .send({ quantity: 1 });
    const cart = await getCart(user.token);

    const res = await api()
      .post(`/api/scents/carts/${cart.id}`)
      .set(auth(user.token))
      .send({ status: 'Completed' });

    expect(res.status).toBe(200);
    expect(res.body.oldCart).toMatchObject({
      id: cart.id,
      is_active: false,
      status: 'Completed',
    });
    expect(res.body.newCart).toMatchObject({ is_active: true, status: 'Created' });

    const orders = await api().get('/api/scents/carts').set(auth(user.token));
    expect(orders.status).toBe(200);
    expect(orders.body.orders).toEqual([
      expect.objectContaining({
        id: cart.id,
        status: 'Completed',
        items: [expect.objectContaining({ product_id: jasmine })],
      }),
    ]);
  });

  it('rejects checking out a cart that is not your active one', async () => {
    const user = await registerUser();

    const res = await api()
      .post('/api/scents/carts/999999')
      .set(auth(user.token))
      .send({ status: 'Completed' });

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('WrongCartError');
  });

  it('rejects a status that is not allowed', async () => {
    const user = await registerUser();
    const cart = await getCart(user.token);

    const res = await api()
      .post(`/api/scents/carts/${cart.id}`)
      .set(auth(user.token))
      .send({ status: 'Shipped' });

    expect(res.body.name).toBe('StatusNotAllowed');
  });

  it('lets an admin change an order status', async () => {
    const user = await registerUser();
    const cart = await getCart(user.token);

    const res = await api()
      .patch(`/api/scents/carts/${cart.id}`)
      .set(auth(await adminToken()))
      .send({ status: 'Processing' });

    expect(res.status).toBe(200);
    expect(res.body.cart).toMatchObject({ id: cart.id, status: 'Processing' });
  });

  it('creates a payment intent for the cart total, in cents', async () => {
    const user = await registerUser();
    const { jasmine, cedar } = await productIds();
    await api()
      .post(`/api/scents/cart_products/${jasmine}`)
      .set(auth(user.token))
      .send({ quantity: 2 });
    await api()
      .post(`/api/scents/cart_products/${cedar}`)
      .set(auth(user.token))
      .send({ quantity: 1 });

    const res = await api().get('/api/scents/carts/stripe-secret').set(auth(user.token));

    // 2 × $10.99 + 1 × $24.50 = $46.48
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Here's you payment info",
      client_secret: 'pi_test_4648_secret',
    });
  });

  it('refuses a payment intent for an empty cart', async () => {
    const user = await registerUser();

    const res = await api().get('/api/scents/carts/stripe-secret').set(auth(user.token));

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('NoItemsInCart');
  });
});

describe('scents Authorization header handling', () => {
  it('rejects a header without the Bearer prefix', async () => {
    const res = await api().get('/api/scents/users/me').set('Authorization', 'Token abc');

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('AuthorizationHeaderError');
  });

  // KNOWN BUG (fixed in Phase 2): a valid token without an `id` hangs.
  it('KNOWN BUG: hangs on a valid token with no id', async () => {
    const token = jwt.sign({ username: 'nobody' }, process.env.JWT_SECRET);

    await expect(
      api().get('/api/scents/products').set(auth(token)).timeout(1000)
    ).rejects.toMatchObject({ timeout: 1000 });
  });
});
