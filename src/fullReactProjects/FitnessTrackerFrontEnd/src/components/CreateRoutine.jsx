import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoutine } from '../apiAdapters';

const CreateRoutine = ({ token }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('')
  const navigate = useNavigate();

  async function postNewRoutine() {
    try {
      const result = await createRoutine(token, name, goal, isPublic);
      console.log('error message here', result)
      if (result && result.id) {
        setName('');
        setGoal('');
        setIsPublic(false);
        navigate('/my-routines');
      } else {
        setError('Routine with this name already exists')
      }
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
            postNewRoutine();
          }}
        >
          <h1>Create Routine</h1>
          <div className="checkbox-parent">
            <h2>Public:</h2>
            <input
              name="public"
              type="checkbox"
              value={isPublic}
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
          <p className='error-message'>{error}</p>
        </form>
      </div>
    </div>
  );
};

export default CreateRoutine;
