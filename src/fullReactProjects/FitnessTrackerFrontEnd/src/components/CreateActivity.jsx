import React, { useState } from 'react';
import { createActivity } from '../apiAdapters';

const CreateActivity = ({ token }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function postNewActivity() {
    try {
      const result = await createActivity(token, name, description);
      if (result.id) {
        setName('');
        setDescription('');
      } else {
        setError('Activity already exists');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="center-form">
      <div className="form-parent">
        <h1>Create New Activity</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            postNewActivity();
          }}
        >
          <h2>Name:</h2>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <h2>Description:</h2>
          <input
            name="description"
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
          <button type="submit">Submit</button>
          <p className='error-message'>{error}</p>
        </form>
      </div>
    </div>
  );
};

export default CreateActivity;
