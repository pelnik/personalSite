import React, { useState, useEffect } from 'react';
import { getRoutinesByActivity } from '../apiAdapters';

const RoutineWithActivity = ({ selectedActivity }) => {
  const [routines, setRoutines] = useState([]);
  const activityId = selectedActivity.activityId;

  async function selectActivityRoutines() {
    try {
      const result = await getRoutinesByActivity(activityId);

      if (Array.isArray(result)) {
        setRoutines(result);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    selectActivityRoutines();
  }, []);

  return (
    <div className="main-content main-layout" id="full-routines-page">
      <h1>Routines with {selectedActivity.activityName}</h1>
      <div></div>
      <div
        className="scrolling-content horizontal-cards"
        id="routine-page-container"
      >
        {[...routines]
          .sort((routine1, routine2) => {
            if (routine1.id > routine2.id) {
              return -1;
            } else {
              return 1;
            }
          })
          .map((routine, idx) => {
            return (
              <div id="routine-container" key={`selected user ${idx}`}>
                <h2>Name: {routine.name}</h2>
                <h3>Goal: {routine.goal}</h3>
                <h3>Creator: {routine.creatorName}</h3>
                <div className="card" id="routine-activity-card">
                  <h3>Activities:</h3>
                  {[...routine.activities]
                    .sort((activity1, activity2) => {
                      if (activity1.id > activity2.id) {
                        return -1;
                      } else {
                        return 1;
                      }
                    })
                    .map((activity, idx) => {
                      return (
                        <div
                          id="routine-activity-container"
                          key={`selected user activity${idx}`}
                        >
                          <h4>Name: {activity.name}</h4>
                          <h5>{activity.description}</h5>
                          <h5>Duration (mins): {activity.duration}</h5>
                          <h5>Count (reps): {activity.count}</h5>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RoutineWithActivity;
