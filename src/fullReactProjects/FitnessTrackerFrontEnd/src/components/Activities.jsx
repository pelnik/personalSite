import React, { useState, useEffect } from 'react';
import { getAllActivities } from '../apiAdapters';
import { useNavigate } from 'react-router-dom';

const Activities = ({ token, setActivityEdit, setSelectedActivity }) => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  async function getAllActivityPage() {
    try {
      const result = await getAllActivities();
      setActivities(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAllActivityPage();
  }, []);

  return (
    <div className="main-content main-layout" id="activities-full-page">
      <div id="activities-header">
        <h1>Activities</h1>
        {token ? (
          <button
            onClick={() => {
              navigate('/activities/new');
            }}
          >
            Create New Activity
          </button>
        ) : null}
      </div>
      <div className="scrolling-content">
        <div id="activities-container">
          {activities.map((activity, idx) => {
            return (
              <div id="activity-container" key={`ActivityPage${idx}`}>
                <h2
                  className="shade-link"
                  onClick={() => {
                    setSelectedActivity({
                      activityId: activity.id,
                      activityName: activity.name,
                    });
                    navigate(`/routines/${activity.id}`);
                  }}
                >
                  {activity.name}
                </h2>
                <p>{activity.description}</p>
                {token ? (
                  <button
                    onClick={() => {
                      setActivityEdit({
                        id: activity.id,
                        name: activity.name,
                        description: activity.description,
                      });
                      navigate('/activities/update');
                    }}
                  >
                    Edit
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Activities;
