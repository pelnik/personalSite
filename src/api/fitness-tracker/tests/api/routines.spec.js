/**
 * Routines API tests using supertest
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');

const {
  addActivityToRoutine,
  createActivity,
  createRoutine,
  createUser,
  getAllPublicRoutines,
  getRoutineById,
  getAllRoutinesByUser,
} = require('../../db');

describe('/api/fitness/routines', () => {
  let theUserNeedsToBeLoggedInError;
  let token;

  const userToCreate = {
    username: 'Miranda',
    password: 'Firefly',
  };

  const routineToCreate = {
    creatorId: 0,
    isPublic: true,
    name: 'rock climbing',
    goal: 'lets climb the wall',
  };

  const routineActivityToCreateAndUpdate = {
    routineId: 0,
    activityId: 0,
    count: 20,
    duration: 300,
  };

  const activityToCreate = {
    name: 'dead lift2',
    description: 'perfect form is the goal',
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
      await addActivityToRoutine(routineActivityToCreateAndUpdate);
    } catch (err) {
      console.log(err);
    }
  });

  describe('GET /api/fitness/routines', () => {
    it('Returns a list of public routines, includes the activities with them', async () => {
      const publicRoutinesFromDB = await getAllPublicRoutines();

      const res = await request(app).get('/api/fitness/routines');
      expect(res.body).toEqual(publicRoutinesFromDB);
    });
  });

  describe('POST /api/fitness/routines', () => {
    beforeAll(async () => {
      const newRoutineToCreate = {
        creatorId: 40000,
        isPublic: true,
        name: 'just another workout',
        goal: 'time to change it up',
      };

      const res = await request(app)
        .post('/api/fitness/routines')
        .send(newRoutineToCreate)
        .set('Authorization', 'Bearer thisIsAFakeToken');

      if (res.status >= 400) {
        theUserNeedsToBeLoggedInError = res.body;
      }
    });

    it('Creates a new routine, with the creatorId matching the logged in user', async () => {
      const newRoutineToCreate = {
        creatorId: 0,
        isPublic: true,
        name: 'workout like a boxer',
        goal: 'to be flow like a butterfly',
      };

      const res = await request(app)
        .post('/api/fitness/routines')
        .send(newRoutineToCreate)
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.name).toEqual(newRoutineToCreate.name);
      expect(res.body.description).toEqual(newRoutineToCreate.description);
    });

    it('Requires logged in user', async () => {
      expect(theUserNeedsToBeLoggedInError).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe('PATCH /api/fitness/routines/:routineId', () => {
    let newRoutineForTesting;
    let errorForNotBeingAuthorized;
    let errorForTryingToEditARoutineThatIsNotYours;

    beforeAll(async () => {
      try {
        // create a new routine that will be used for testing PATCH
        const newRoutineToCreate = {
          creatorId: 40000,
          isPublic: true,
          name: 'lets go sprinting today',
          goal: 'to increase our need for speed',
        };

        const res = await request(app)
          .post('/api/fitness/routines')
          .send(newRoutineToCreate)
          .set('Authorization', `Bearer ${token}`);

        newRoutineForTesting = res.body;
      } catch (err) {
        console.log(err);
      }
    });

    beforeAll(async () => {
      const dataForPatchingRoutine = {
        isPublic: false,
        name: 'running out of names',
        goal: 'go faster',
      };

      // this generates an error because we are sending a fake token
      const res = await request(app)
        .patch(`/api/fitness/routines/${newRoutineForTesting.id}`)
        .send(dataForPatchingRoutine)
        .set('Authorization', 'Bearer thisIsAFakeToken');

      if (res.status >= 400) {
        errorForNotBeingAuthorized = res.body;
      }
    });

    beforeAll(async () => {
      try {
        // creating a second user
        const secondUserData = {
          username: 'Mal',
          password: 'Serenity',
        };
        const secondUser = await createUser(secondUserData);
        let secondUserToken;

        const loginRes = await request(app)
          .post('/api/fitness/users/login')
          .send(secondUserData);

        // getting the token for the second user
        secondUserToken = loginRes.body.token;

        const newRoutineToCreate = {
          creatorId: secondUser.id,
          isPublic: true,
          name: 'exercises to help fly a space ship',
          goal: 'to fly a ship',
        };

        const newDataForPatchingRoutine = {
          name: 'exercises to help fly a space ship better',
          goal: 'to fly a ship without crashing',
        };

        // Create a routine so we can attempt to update it. Using the secondUserToken
        const createRes = await request(app)
          .post('/api/fitness/routines')
          .send(newRoutineToCreate)
          .set('Authorization', `Bearer ${secondUserToken}`);

        console.log('responded routine', createRes.body);

        // Attempt to patch a routine made with the secondUserToken, while passing in the token from the first user
        const patchRes = await request(app)
          .patch(`/api/fitness/routines/${createRes.body.id}`)
          .send(newDataForPatchingRoutine)
          .set('Authorization', `Bearer ${token}`);

        if (patchRes.status >= 400) {
          errorForTryingToEditARoutineThatIsNotYours = patchRes.body;
        }
      } catch (err) {
        console.log(err);
      }
    });

    it('Updates a routine, notably changing public/private, the name, and the goal', async () => {
      const newRoutineToCreate = {
        creatorId: 0,
        isPublic: true,
        name: 'back to basics',
        goal: 'body weight exercises',
      };

      // Create a routine so we can update it.
      const createRes = await request(app)
        .post('/api/fitness/routines')
        .send(newRoutineToCreate)
        .set('Authorization', `Bearer ${token}`);

      const updateRoutineData = {
        isPublic: false,
        name: 'Every other day',
        goal: 'Until I lose 10 lbs.',
      };

      const patchRes = await request(app)
        .patch(`/api/fitness/routines/${createRes.body.id}`)
        .send(updateRoutineData)
        .set('Authorization', `Bearer ${token}`);

      expect(patchRes.body).toMatchObject(updateRoutineData);
    });

    it('Requires logged in user', async () => {
      expect(errorForNotBeingAuthorized).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });

    it('returns a 403 when a user tries to edit a routine that is not theirs', async () => {
      expect(errorForTryingToEditARoutineThatIsNotYours).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe('DELETE /api/fitness/routines/:routineId', () => {
    let errorForTryingToDeleteARoutineThatIsNotYours;

    beforeAll(async () => {
      try {
        // creating a second user
        const secondUserData = {
          username: 'Jane',
          password: 'Vera',
        };
        const secondUser = await createUser(secondUserData);
        let secondUserToken;

        const loginRes = await request(app)
          .post('/api/fitness/users/login')
          .send(secondUserData);

        // getting the token for the second user
        secondUserToken = loginRes.body.token;

        const newRoutineToCreate = {
          creatorId: secondUser.id,
          isPublic: true,
          name: 'working out on a space ship',
          goal: 'what happens if the ship rolls??',
        };

        // Create a routine so we can attempt to update it. Using the secondUserToken
        const createRes = await request(app)
          .post('/api/fitness/routines')
          .send(newRoutineToCreate)
          .set('Authorization', `Bearer ${secondUserToken}`);

        // Attempt to delete a routine made with the secondUserToken, while passing in the token from the first user
        const deleteRes = await request(app)
          .delete(`/api/fitness/routines/${createRes.body.id}`)
          .set('Authorization', `Bearer ${token}`);

        if (deleteRes.status >= 400) {
          errorForTryingToDeleteARoutineThatIsNotYours = deleteRes.body;
        }
      } catch (err) {
        console.log(err);
      }
    });

    it('Hard deletes a routine. Makes sure to delete all the routineActivities whose routine is the one being deleted.', async () => {
      // Create a routine so we can delete it
      const newRoutineToCreateToBeDeleted = {
        creatorId: 0,
        isPublic: true,
        name: 'Modern Dance',
        goal: 'to learn to dance',
      };

      const createRes = await request(app)
        .post('/api/fitness/routines')
        .send(newRoutineToCreateToBeDeleted)
        .set('Authorization', `Bearer ${token}`);

      const deleteRes = await request(app)
        .delete(`/api/fitness/routines/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      const shouldBeDeleted = await getRoutineById(deleteRes.body.id);
      expect(deleteRes.body.id).toBe(createRes.body.id);
      expect(deleteRes.body.name).toBe(createRes.body.name);
      expect(deleteRes.body.goal).toBe(createRes.body.goal);
      expect(shouldBeDeleted).toBeFalsy();
    });

    it("returns a 403 when the user deletes a routine that isn't theirs", async () => {
      expect(errorForTryingToDeleteARoutineThatIsNotYours).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe('POST /api/fitness/routines/:routineId/activities', () => {
    let routineActivityThatWeCreated;
    let firstUserRoutine;
    let errorForTryingToAddAnActivityToARoutineThatIsNotYours;

    beforeAll(async () => {
      try {
        // get the user info
        const currentUserRoutines = await getAllRoutinesByUser(userToCreate);
        firstUserRoutine = currentUserRoutines[0];

        // create an activity data
        const newActivityToCreate = {
          name: 'figure skating',
          description: 'be graceful on the ice',
        };

        // create an activity in the database
        const activityRes = await request(app)
          .post('/api/fitness/activities')
          .send(newActivityToCreate)
          .set('Authorization', `Bearer ${token}`);

        // create a routine activity
        const routineActivityToAddToARoutine = {
          routineId: firstUserRoutine.id,
          activityId: activityRes.body.id,
          count: 200,
          duration: 3000,
        };

        // add the routine activity to the database
        const raRes = await request(app)
          .post(`/api/fitness/routines/${firstUserRoutine.id}/activities`)
          .send(routineActivityToAddToARoutine)
          .set('Authorization', `Bearer ${token}`);

        routineActivityThatWeCreated = raRes.body;
      } catch (err) {
        console.log(err);
      }
    });

    beforeAll(async () => {
      // using the routine activity that we added to our user in the above before all.
      // We will attempt to add the same routine activity again, which should throw an error.
      const res = await request(app)
        .post(`/api/fitness/routines/${firstUserRoutine.id}/activities`)
        .send(routineActivityThatWeCreated)
        .set('Authorization', `Bearer ${token}`);

      if (res.status >= 400) {
        errorForTryingToAddAnActivityToARoutineThatIsNotYours = res.body;
      }
    });

    it('Attaches a single activity to a routine.', async () => {
      const currentUserRoutines = await getAllRoutinesByUser(userToCreate);
      const firstUserRoutine = currentUserRoutines[0];

      const newActivityToCreate = {
        name: 'ice skating',
        description: 'be one with the ice',
      };

      const activityRes = await request(app)
        .post('/api/fitness/activities')
        .send(newActivityToCreate)
        .set('Authorization', `Bearer ${token}`);

      const routineActivityToAddToARoutine = {
        routineId: firstUserRoutine.id,
        activityId: activityRes.body.id,
        count: 20,
        duration: 300,
      };

      const raRes = await request(app)
        .post(`/api/fitness/routines/${firstUserRoutine.id}/activities`)
        .send(routineActivityToAddToARoutine)
        .set('Authorization', `Bearer ${token}`);

      expect(raRes.body).toMatchObject(routineActivityToAddToARoutine);
    });

    it('Prevents duplication on (routineId, activityId) pair.', async () => {
      expect(
        errorForTryingToAddAnActivityToARoutineThatIsNotYours
      ).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });
});
