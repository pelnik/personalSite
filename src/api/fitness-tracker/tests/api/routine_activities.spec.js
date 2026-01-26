/**
 * Routine Activities API tests using supertest
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');

const {
  addActivityToRoutine,
  createActivity,
  createRoutine,
  createUser,
  getRoutineActivityById,
} = require('../../db');

describe('/api/fitness/routine_activities', () => {
  let token;
  let secondUserToken;
  let theUserNeedsToBeLoggedInToPatchError;
  let theUserNeedsToBeLoggedInToDeleteError;
  let routineActivityThatWasCreated;

  const userToCreate = {
    username: 'Wash',
    password: 'Flying',
  };

  const secondUserToCreate = {
    username: 'Anara',
    password: 'Flying',
  };

  const routineToCreate = {
    creatorId: 0,
    isPublic: true,
    name: 'spartan training',
    goal: 'lets climb the wall and then run',
  };

  const routineActivityToCreateAndUpdate = {
    routineId: 0,
    activityId: 0,
    count: 2,
    duration: 3,
  };

  const activityToCreate = {
    name: 'farmer carry',
    description: 'perfect for life on a farm',
  };

  beforeAll(async () => {
    try {
      // creates a user
      const newUser = await createUser(userToCreate);
      routineToCreate.creatorId = newUser.id;

      // login as the user to generate a token
      const loginRes = await request(app)
        .post('/api/fitness/users/login')
        .send(userToCreate);
      token = loginRes.body.token;

      // creates an activity
      const newActivity = await createActivity(activityToCreate);

      // creates a routine that is attached to the above user
      const newRoutine = await createRoutine(routineToCreate);
      routineActivityToCreateAndUpdate.routineId = newRoutine.id;

      routineActivityToCreateAndUpdate.activityId = newActivity.id;

      // adds the newActivity to the above routine
      routineActivityThatWasCreated = await addActivityToRoutine(
        routineActivityToCreateAndUpdate
      );

      // creating a second user
      await createUser(secondUserToCreate);

      // login as the second user to generate a token
      const secondLoginRes = await request(app)
        .post('/api/fitness/users/login')
        .send(secondUserToCreate);
      secondUserToken = secondLoginRes.body.token;
    } catch (err) {
      console.error(err);
    }
  });

  describe('PATCH /api/fitness/routine_activities/:routineActivityId', () => {
    beforeAll(async () => {
      const newRoutineActivityData = {
        count: 33,
        duration: 9,
      };

      const res = await request(app)
        .patch(`/api/fitness/routine_activities/${routineActivityThatWasCreated.id}`)
        .send(newRoutineActivityData)
        .set('Authorization', `Bearer ${secondUserToken}`);

      if (res.status >= 400) {
        theUserNeedsToBeLoggedInToPatchError = res.body;
      }
    });

    it('Updates the count or duration on the routine activity', async () => {
      const newRoutineActivityData = {
        count: 55,
        duration: 45,
      };

      const res = await request(app)
        .patch(`/api/fitness/routine_activities/${routineActivityThatWasCreated.id}`)
        .send(newRoutineActivityData)
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.count).toEqual(newRoutineActivityData.count);
      expect(res.body.duration).toEqual(newRoutineActivityData.duration);
    });

    it("should return an error if the owner of the routine isn't the one trying to edit it", async () => {
      expect(theUserNeedsToBeLoggedInToPatchError).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe('DELETE /api/fitness/routine_activities/:routineActivityId', () => {
    beforeAll(async () => {
      const res = await request(app)
        .delete(`/api/fitness/routine_activities/${routineActivityThatWasCreated.id}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      if (res.status >= 400) {
        theUserNeedsToBeLoggedInToDeleteError = res.body;
      }
    });

    it('Removes an activity from a routine, uses hard delete', async () => {
      const newActivityToCreate = {
        name: 'swimming',
        description: 'just keep swimming',
      };

      // creates an activity
      const newActivity = await createActivity(newActivityToCreate);

      // data for a new routine
      const newRoutineData = {
        creatorId: routineToCreate.creatorId,
        isPublic: true,
        name: 'triathlon training',
        goal: 'all the exercises',
      };

      // creates a routine that is attached to the above user
      const newRoutine = await createRoutine(newRoutineData);

      const newRoutineActivityToCreateAndDestroy = {
        routineId: newRoutine.id,
        activityId: newActivity.id,
        count: 2,
        duration: 3,
      };
      // adds the newActivity to the above routine
      const newRoutineActivityThatWasCreated = await addActivityToRoutine(
        newRoutineActivityToCreateAndDestroy
      );

      const res = await request(app)
        .delete(`/api/fitness/routine_activities/${newRoutineActivityThatWasCreated.id}`)
        .set('Authorization', `Bearer ${token}`);

      const shouldBeDeleted = await getRoutineActivityById(res.body.id);

      expect(res.body.id).toBe(newRoutineActivityThatWasCreated.id);
      expect(res.body.count).toBe(newRoutineActivityThatWasCreated.count);
      expect(res.body.duration).toBe(newRoutineActivityThatWasCreated.duration);
      expect(shouldBeDeleted).toBeFalsy();
    });

    it('Logged in user should be the owner of the modified object.', async () => {
      expect(theUserNeedsToBeLoggedInToDeleteError).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });
});
