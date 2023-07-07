const express = require('express');
const scentsRouter = express.Router();
const { JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');

//setting `req.user`
scentsRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

// GET /api/health
scentsRouter.get('/health', async (req, res, next) => {
  res.send({
    message: 'All is well',
  });
});

// ROUTER: /api/users
const usersRouter = require('./users');
scentsRouter.use('/users', usersRouter);

// ROUTER: /api/carts
const cartsRouter = require('./carts');
scentsRouter.use('/carts', cartsRouter);

// ROUTER: /api/products
const productsRouter = require('./products');
scentsRouter.use('/products', productsRouter);

// ROUTER: /api/carts_products_router
const cartProductsRouter = require('./cart_products');
scentsRouter.use('/cart_products', cartProductsRouter);

// ROUTER: /api/categoriesRouter
const categoriesRouter = require('./categories');
scentsRouter.use('/categories', categoriesRouter);

module.exports = scentsRouter;
