const client = require('./client');

// Work on this file SECOND

// activities functions

// create and returns the new activity
// ** this function needs to be completed first because other tests rely on it.
async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      INSERT INTO activities(name, description)
      VALUES($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
      `,
      [name, description]
    );

    return activity;
  } catch (error) {
    console.error('error creating activity');
    throw error;
  }
}

// this function returns an array of all of the activities
async function getAllActivities() {
  try {
    const { rows } = await client.query(
      `
    SELECT *
    FROM activities
  `
    );

    return rows;
  } catch (error) {
    console.error('error getting all activities');
    throw error;
  }
}

// this function should return a single activity (object) from the database that
//matches the name that is passed in as an argument.
async function getActivityByName(name) {
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
    SELECT *
    FROM activities
    WHERE name = $1;
  `,
      [name]
    );

    return activities;
  } catch (error) {
    console.error('error getting activity by name');
    throw error;
  }
}

// this function should return a single activity (object) from the database that matches the id that is passed in as an argument.
async function getActivityById(id) {
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
      SELECT *
      FROM activities
      WHERE id = $1;
    `,
      [id]
    );

    return activities;
  } catch (error) {
    console.error('error getting activity by id');
    throw error;
  }
}

// The id should not be changed
// You should be able to update the name, or the description, or name & description.
// return the updated activity
async function updateActivity(fields = {}) {
  const id = fields.id;
  delete fields.id;
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(', ');

  try {
    const {
      rows: [activities],
    } = await client.query(
      `
    UPDATE activities
    SET ${setString}
    WHERE id = ${id}
    RETURNING *;
    `,
      Object.values(fields)
    );

    return activities;
  } catch (error) {
    console.error('error updating activities');
    throw error;
  }
}

// Do NOT modify the attachActivitiesToRoutines function.
// You will need to use this function in your routines.js file
// whenever you need to attach activities to your routines.
async function attachActivitiesToRoutines(routines) {
  // no side effects
  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(', ');
  const routineIds = routines.map((routine) => routine.id);
  if (!routineIds?.length) return [];

  try {
    // get the activities, JOIN with routine_activities (so we can get a routineId), and only those that have those routine ids on the routine_activities join
    const { rows: activities } = await client.query(
      `
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${binds});
    `,
      routineIds
    );

    // loop over the routines
    for (const routine of routinesToReturn) {
      // filter the activities to only include those that have this routineId
      const activitiesToAdd = activities.filter(
        (activity) => activity.routineId === routine.id
      );
      // attach the activities to each single routine
      routine.activities = activitiesToAdd;
    }
    return routinesToReturn;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  createActivity,
  updateActivity,
  attachActivitiesToRoutines,
};
