import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateRoutine } from '../apiAdapters';

const UpdateRoutine = ({ token, myRoutineEdit, setMyRoutineEdit }) => {
  const [isPublic, setIsPublic] = useState(myRoutineEdit.isPublic);
  const [name, setName] = useState(myRoutineEdit.name);
  const [goal, setGoal] = useState(myRoutineEdit.goal);
  const navigate = useNavigate();
  const routineId = myRoutineEdit.routineId;

  async function updateMyRoutine(isPublic, name, goal) {
    try {
      const result = await updateRoutine(
        token,
        isPublic,
        name,
        goal,
        routineId
      );
      setMyRoutineEdit({});
      navigate('/my-routines');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="center-form">
      <div className="form-parent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMyRoutine(isPublic, name, goal);
          }}
        >
          <h1>Edit Routine</h1>
          <div className="checkbox-parent">
            <h2>Public:</h2>
            <input
              name="public"
              type="checkbox"
              value={isPublic}
              checked={isPublic}
              onChange={(e) => {
                setIsPublic(e.target.checked);
              }}
            />
          </div>
          <h2>Name:</h2>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <h2>Goal:</h2>
          <input
            name="goal"
            type="text"
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
            }}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateRoutine;
