import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Register,
  Login,
  Routines,
  MyRoutines,
  UpdateRoutine,
  CreateRoutine,
  UpdateRoutineActivity,
  Activities,
  CreateActivity,
  CreatorRoutines,
  RoutineWithActivity,
  UpdateActivity,
  Homepage,
} from './';
import { Routes, Route } from 'react-router-dom';
import { getTokenFromLocalStorage } from '../utils/localStorage';

const Main = () => {
  const [token, setToken] = useState('');
  const [myRoutineEdit, setMyRoutineEdit] = useState({});
  const [myRoutineActivityEdit, setMyRoutineActivityEdit] = useState({});
  const [activityEdit, setActivityEdit] = useState({});
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedActivity, setSelectedActivity] = useState({});

  useEffect(() => {
    setToken(getTokenFromLocalStorage());
  }, []);

  useEffect(() => {
    console.log('main token', token);
  }, [token]);

  return (
    <div id="main">
      <Navbar setToken={setToken} token={token} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/users/register"
          element={<Register setToken={setToken} token={token} />}
        />
        <Route
          path="/users/login"
          element={<Login setToken={setToken} token={token} />}
        />
        <Route
          path="/routines"
          element={
            <Routines
              setSelectedUser={setSelectedUser}
              selectedActivity={selectedActivity}
              setSelectedActivity={setSelectedActivity}
            />
          }
        />
        <Route
          path="/my-routines"
          element={
            <MyRoutines
              token={token}
              setMyRoutineEdit={setMyRoutineEdit}
              setMyRoutineActivityEdit={setMyRoutineActivityEdit}
              setSelectedActivity={setSelectedActivity}
            />
          }
        />
        <Route
          path="/my-routines/new"
          element={<CreateRoutine token={token} />}
        />
        <Route
          path="/my-routines/update"
          element={
            <UpdateRoutine
              token={token}
              myRoutineEdit={myRoutineEdit}
              setMyRoutineEdit={setMyRoutineEdit}
            />
          }
        />
        <Route
          path="/my-routines/update-routine-activity"
          element={
            <UpdateRoutineActivity
              token={token}
              myRoutineActivityEdit={myRoutineActivityEdit}
              setMyRoutineActivityEdit={setMyRoutineActivityEdit}
            />
          }
        />
        <Route
          path="/activities"
          element={
            <Activities
              token={token}
              setActivityEdit={setActivityEdit}
              setSelectedActivity={setSelectedActivity}
            />
          }
        />
        <Route
          path="/activities/new"
          element={<CreateActivity token={token} />}
        />
        <Route
          path="/activities/update"
          element={
            <UpdateActivity
              token={token}
              activityEdit={activityEdit}
              setActivityEdit={setActivityEdit}
            />
          }
        />
        <Route
          path="/:username/routines"
          element={
            <CreatorRoutines
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
          }
        />
        <Route
          path="/routines/:activityId"
          element={
            <RoutineWithActivity
              selectedActivity={selectedActivity}
              setSelectedActivity={setSelectedActivity}
            />
          }
        />
        <Route path="*" element={null} />
      </Routes>
    </div>
  );
};

export default Main;
