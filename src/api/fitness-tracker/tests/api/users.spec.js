/**
 * User API tests using supertest
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');
const { faker } = require('@faker-js/faker');
const client = require('../../db/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { expectNotToBeError } = require('../expectHelpers');

const { JWT_SECRET = 'neverTell' } = process.env;

const {
  getPublicRoutinesByUser,
  getAllRoutinesByUser,
  getUserById,
} = require('../../db');

describe('/api/fitness/users', () => {
  let token, registeredUser;
  let newUser = { username: 'robert', password: 'bobbylong321' };
  let newUserShortPassword = { username: 'robertShort', password: 'bobby21' };

  describe('POST /api/fitness/users/register', () => {
    let tooShortResponse;

    beforeAll(async () => {
      const successResponse = await request(app)
        .post('/api/fitness/users/register')
        .send(newUser);
      registeredUser = successResponse.body.user;

      tooShortResponse = await request(app)
        .post('/api/fitness/users/register')
        .send(newUserShortPassword);
    });

    it('Creates a new user.', async () => {
      const fakeUserData = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };
      console.log(fakeUserData, 'fakeUserData');
      const res = await request(app)
        .post('/api/fitness/users/register')
        .send(fakeUserData);
      console.log(res.body, 'data');
      expectNotToBeError(res.body);

      expect(res.body).toMatchObject({
        message: expect.any(String),
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          username: fakeUserData.username,
        },
      });
    });

    it('EXTRA CREDIT: Hashes password before saving user to DB.', async () => {
      const fakeUserData = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };

      const res = await request(app)
        .post('/api/fitness/users/register')
        .send(fakeUserData);

      expectNotToBeError(res.body);

      const {
        rows: [user],
      } = await client.query(
        `
          SELECT *
          FROM users
          WHERE id = $1;
        `,
        [res.body.user.id]
      );

      const hashedPassword = user.password;

      expect(fakeUserData.password).not.toBe(hashedPassword);
      expect(await bcrypt.compare(fakeUserData.password, hashedPassword)).toBe(
        true
      );
    });

    it('Throws errors for duplicate username', async () => {
      const res = await request(app)
        .post('/api/fitness/users/register')
        .send(newUser);

      expect(res.status).toBe(400);
      expect(res.body).toBeTruthy();
    });

    it('Throws errors for password-too-short.', async () => {
      expect(tooShortResponse.status).toBe(400);
      expect(tooShortResponse.body).toBeTruthy();
    });
  });

  describe('POST /api/fitness/users/login', () => {
    it('Logs in the user. Requires username and password, and verifies that hashed login password matches the saved hashed password.', async () => {
      const res = await request(app)
        .post('/api/fitness/users/login')
        .send(newUser);
      token = res.body.token;
      expect(res.body.token).toBeTruthy();
    });
    it('Returns a JSON Web Token. Stores the id and username in the token.', async () => {
      const parsedToken = jwt.verify(token, JWT_SECRET);
      expect(parsedToken.id).toEqual(registeredUser.id);
      expect(parsedToken.username).toEqual(registeredUser.username);
    });
  });

  describe('GET /api/fitness/users/me', () => {
    it('sends back users data if valid token is supplied in header', async () => {
      const res = await request(app)
        .get('/api/fitness/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.username).toBeTruthy();
      expect(res.body.username).toBe(registeredUser.username);
    });
    it('rejects requests with no valid token', async () => {
      const res = await request(app).get('/api/fitness/users/me');

      expect(res.status).toBe(400);
      expect(res.body).toBeTruthy();
    });
  });

  describe('GET /api/fitness/users/:username/routines', () => {
    it('Gets a list of public routines for a particular user.', async () => {
      const userId = 2;
      const userWithRoutines = await getUserById(userId);
      const res = await request(app).get(
        `/api/fitness/users/${userWithRoutines.username}/routines`
      );
      const routinesFromDB = await getPublicRoutinesByUser(userWithRoutines);
      expect(res.body).toBeTruthy();
      expect(res.body).toEqual(routinesFromDB);
    });

    it('gets a list of all routines for the logged in user', async () => {
      const meRes = await request(app)
        .get('/api/fitness/users/me')
        .set('Authorization', `Bearer ${token}`);

      const routinesRes = await request(app).get(
        `/api/fitness/users/${meRes.body.username}/routines`
      );
      const routinesFromDB = await getAllRoutinesByUser(meRes.body);
      expect(routinesRes.body).toBeTruthy();
      expect(routinesRes.body).toEqual(routinesFromDB);
    });
  });
});
