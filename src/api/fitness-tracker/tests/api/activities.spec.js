/**
 * Activities API tests using supertest
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');

const {
  addActivityToRoutine,
  createActivity,
  createUser,
  createRoutine,
  getPublicRoutinesByActivity,
  getAllPublicRoutines,
} = require('../../db');

describe('/api/fitness/activities', () => {
  let thisActivityDoesNotExistError;
  let thisActivityAlreadyExists;
  let token;

  const userToCreate = {
    username: 'Vertigo',
    password: 'LookIntoTheEyes',
  };

  const routineToCreate = {
    creatorId: 0,
    isPublic: true,
    name: 'buff it up',
    goal: 'lets get fit',
  };

  const routineActivityToCreateAndUpdate = {
    routineId: 0,
    activityId: 0,
    count: 20,
    duration: 300,
  };

  const activityToCreate = {
    name: 'dead lift',
    description: 'perfect form is the goal',
  };

  const activityToCreateAndThenUpdate = {
    name: 'curling',
    description: 'it occurs on ice',
  };

  beforeAll(async () => {
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
    await addActivityToRoutine(routineActivityToCreateAndUpdate);
  });

  describe('GET /api/fitness/activities', () => {
    it('Just returns a list of all activities in the database', async () => {
      // Create a fake activity to watch for
      const curls = { name: 'curls', description: '4 sets of 15.' };
      const createdActivity = await createActivity(curls);
      const res = await request(app).get('/api/fitness/activities');
      const activities = res.body;
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].name).toBeTruthy();
      expect(activities[0].description).toBeTruthy();
      const [filteredActivity] = activities.filter(
        (activity) => activity.id === createdActivity.id
      );
      expect(filteredActivity.name).toEqual(curls.name);
      expect(filteredActivity.description).toEqual(curls.description);
    });
  });

  describe('GET /api/fitness/activities/:activityId/routines', () => {
    beforeAll(async () => {
      const res = await request(app).get('/api/fitness/activities/10000/routines');
      if (res.status >= 400) {
        thisActivityDoesNotExistError = res.body;
      }
    });

    it('Get a list of all public routines which feature that activity', async () => {
      const [testRoutine] = await getAllPublicRoutines();
      const [testActivity] = testRoutine.activities;
      const res = await request(app).get(
        `/api/fitness/activities/${testActivity.id}/routines`
      );
      const routinesFromDB = await getPublicRoutinesByActivity(testActivity);
      expect(res.body).toEqual(routinesFromDB);
    });

    it('Should return an error when you ask for an activity that does not exist', async () => {
      expect(thisActivityDoesNotExistError).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe('POST /api/fitness/activities', () => {
    const activityToTestDuplicateErrorHandling = {
      name: 'pull ups are very useful',
      description: 'they take time and consistent effort to improve',
    };

    beforeAll(async () => {
      // this is to create the activity
      await request(app)
        .post('/api/fitness/activities')
        .send(activityToTestDuplicateErrorHandling)
        .set('Authorization', `Bearer ${token}`);
    });

    beforeAll(async () => {
      // this is to try and create a duplicate activity and to save the error
      const res = await request(app)
        .post('/api/fitness/activities')
        .send(activityToTestDuplicateErrorHandling)
        .set('Authorization', `Bearer ${token}`);
      if (res.status >= 400) {
        thisActivityAlreadyExists = res.body;
      }
    });

    it('Creates a new activity', async () => {
      const activityToCreateAndUpdate = {
        name: 'jump rope like a boxer',
        description: 'it is great cardio',
      };

      const res = await request(app)
        .post('/api/fitness/activities')
        .send(activityToCreateAndUpdate)
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.name).toEqual(activityToCreateAndUpdate.name);
      expect(res.body.description).toEqual(activityToCreateAndUpdate.description);
    });

    it('responds with an error when a activity already exists with the same name', async () => {
      expect(thisActivityAlreadyExists).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe('PATCH /api/fitness/activities/:activityId', () => {
    let createdActivityToBePatched;
    let errorForWhenAnActivityDoesNotExist;
    let dataForActivityThatWillBeUsedToCheckTheErrorHandling;
    let errorForWhenThePatchAttemptsToChangeTheNameToOneThatExists;

    beforeAll(async () => {
      // this is to create the activity that we will then attempt to update
      const res = await request(app)
        .post('/api/fitness/activities')
        .send(activityToCreateAndThenUpdate)
        .set('Authorization', `Bearer ${token}`);
      createdActivityToBePatched = res.body;
    });

    beforeAll(async () => {
      // this attempt to patch an activity that does not exist
      const activityThatShouldNotExist = {
        name: 'sedentary behavior',
        description: 'moving is good',
      };
      const res = await request(app)
        .patch('/api/fitness/activities/424242424242')
        .send(activityThatShouldNotExist)
        .set('Authorization', `Bearer ${token}`);
      if (res.status >= 400) {
        errorForWhenAnActivityDoesNotExist = res.body;
      }
    });

    beforeAll(async () => {
      // this create an activity that we will use in the next beforeAll
      const aNewActivityToUseAsATest = {
        name: 'Boat',
        description: 'Deceptively challenging',
      };

      const res = await request(app)
        .post('/api/fitness/activities')
        .send(aNewActivityToUseAsATest)
        .set('Authorization', `Bearer ${token}`);

      dataForActivityThatWillBeUsedToCheckTheErrorHandling = res.body;
    });

    beforeAll(async () => {
      // this will attempt to patch an activity and change the name to one that already exists
      const patchData = {
        name: dataForActivityThatWillBeUsedToCheckTheErrorHandling.name,
        description: 'change can be good',
      };
      const res = await request(app)
        .patch(`/api/fitness/activities/${createdActivityToBePatched.id}`)
        .send(patchData)
        .set('Authorization', `Bearer ${token}`);
      if (res.status >= 400) {
        errorForWhenThePatchAttemptsToChangeTheNameToOneThatExists = res.body;
      }
    });

    it('Anyone can update an activity', async () => {
      const newActivityData = {
        name: 'Double Bicep Curls',
        description: 'They hurt EVEN MORE, but you will thank you later',
      };
      const res = await request(app)
        .patch(`/api/fitness/activities/${createdActivityToBePatched.id}`)
        .send(newActivityData)
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.name).toEqual(newActivityData.name);
      expect(res.body.description).toEqual(newActivityData.description);
    });

    it('returns an error when updating an activity that does not exist', async () => {
      expect(errorForWhenAnActivityDoesNotExist).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });

    it('returns an error when changing an activity to have the name of an existing activity', async () => {
      expect(
        errorForWhenThePatchAttemptsToChangeTheNameToOneThatExists
      ).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });
});
