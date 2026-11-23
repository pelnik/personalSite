const express = require('express');
const usersRouter = express.Router();
const {
  getAllUsers,
  updateUser,
  getUserById,
} = require('../db');
const { requireUser, requireActiveUser } = require('./utils');

usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

usersRouter.delete(
  '/:userId',
  requireUser,
  requireActiveUser,
  async (req, res, next) => {
    const userId = Number(req.params.userId);

    try {
      if (!Number.isInteger(userId)) {
        return next({
          name: 'UserNotFound',
          message: "User doesn't exist.",
        });
      }

      if (req.user === undefined) {
        next({
          name: 'InvalidUserLoginDelete',
          message: 'Login to delete.',
        });
      }

      const user = await getUserById(userId);

      if (user && user.id === req.user.id) {
        const updatedUser = await updateUser(userId, { active: false });

        res.send({ user: updatedUser });
      } else {
        next(
          user
            ? {
                name: 'InvalidUserDelete',
                message: 'Cannot delete another user.',
              }
            : {
                name: 'UserNotFound',
                message: "User doesn't exist.",
              }
        );
      }
    } catch ({ name, message }) {
      next({
        name,
        message,
      });
    }
  }
);

module.exports = usersRouter;
