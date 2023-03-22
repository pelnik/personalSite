import React, { useState, useEffect } from "react";
import { updateActivity } from "../apiAdapters";
import { useNavigate } from "react-router-dom";

const UpdateActivity = ({ token, activityEdit, setActivityEdit }) => {
  const [name, setName] = useState(activityEdit.name);
  const [description, setDescription] = useState(activityEdit.description)
  const navigate = useNavigate();
  const activityId = activityEdit.id

  console.log(typeof(activityId), "type of activityId")

  async function editActivity(name, description) {
    try {
      const result = await updateActivity(token, activityId, name, description);
      setActivityEdit({})
      navigate('/activities')
    } catch (error) {
      console.log(error);
    }
  }

  return(
    <div className="center-form">
        <div className="form-parent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editActivity(name, description);
          }}
        >
          <h1>Edit Activity</h1>
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
        </form>
      </div>
    </div>
  )
};

export default UpdateActivity;
