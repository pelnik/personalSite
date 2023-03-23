let BASE;

if (process.env.SERVER_ENV === 'production') {
  BASE = 'https://pelnik.dev/api/fitness';
} else {
  BASE = 'http://localhost:3000/api/fitness';
}

export const registerAccount = async (username, password) => {
  try {
    const response = await fetch(`${BASE}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {}
};

export const loginAccount = async (username, password) => {
  try {
    const response = await fetch(`${BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {}
};

export const getAllRoutines = async () => {
  try {
    const response = await fetch(`${BASE}/routines`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const getMyUser = async (token) => {
  try {
    const response = await fetch(`${BASE}/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
};

export const updateRoutine = async (token, isPublic, name, goal, routineId) => {
  try {
    const response = await fetch(`${BASE}/routines/${routineId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isPublic,
        name,
        goal,
      }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const deleteRoutine = async (token, routineId) => {
  try {
    const response = await fetch(`${BASE}/routines/${routineId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const createRoutine = async (token, name, goal, isPublic) => {
  try {
    const response = await fetch(`${BASE}/routines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        goal,
        isPublic,
      }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export async function getAllActivities() {
  try {
    const response = await fetch(`${BASE}/activities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {}
}

export async function addActivityToRoutine(
  routineId,
  activityId,
  count,
  duration
) {
  try {
    const response = await fetch(`${BASE}/routines/${routineId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId,
        count,
        duration,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {}
}

export async function deleteActivityFromRoutine(token, routineActivityId) {
  try {
    const response = await fetch(
      `${BASE}/routine_activities/${routineActivityId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {}
}

export const updateRoutineActivity = async (
  token,
  routineActivityId,
  duration,
  count
) => {
  try {
    const response = await fetch(
      `${BASE}/routine_activities/${routineActivityId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          duration,
          count,
        }),
      }
    );
    const result = await response.json();

    return result;
  } catch (error) {}
};

export const createActivity = async (token, name, description) => {
  try {
    const response = await fetch(`${BASE}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });
    const result = await response.json();
    return result;
  } catch (error) {}
};

export const getUsersRoutines = async (username) => {
  try {
    const response = await fetch(`${BASE}/users/${username}/routines`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {}
};

export const getRoutinesByActivity = async (activityId) => {
  try {
    const response = await fetch(`${BASE}/activities/${activityId}/routines`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {}
};

export const updateActivity = async (token, activityId, name, description) => {
  try {
    const response = await fetch(`${BASE}/activities/${activityId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};
