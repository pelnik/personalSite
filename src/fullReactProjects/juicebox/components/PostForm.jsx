import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { newPost } from '../api-adapter';

function PostForm(props) {
  const token = props.token;
  const posts = props.posts;
  const setPosts = props.setPosts;

  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const titleOnChange = (evt) => {
    setTitle(evt.target.value);
  };

  const contentOnChange = (evt) => {
    setContent(evt.target.value);
  };

  function onClickLogIn(evt) {
    navigate('/juicebox/login');
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const createdPost = await newPost(token, title, content);

    if (createdPost) {
      const updatedPosts = [...posts];
      updatedPosts.push(createdPost);
      setPosts(updatedPosts);

      setTitle('');
      setContent('');

      navigate('/juicebox/');
    }
  };

  return (
    <div className="formContainer" id="post">
      {!token ? (
        <Button
          onClick={onClickLogIn}
          variant="outlined"
          className="post-button log-in-error"
        >
          Please Log In
        </Button>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <h1>Create New Post</h1>
          <label>
            <TextField
              type="text"
              value={title}
              name="title"
              onChange={titleOnChange}
              variant="outlined"
              label="Title"
            />
          </label>
          <label>
            <TextField
              id="outlined-multiline-static"
              label="Content"
              placeholder="Type here"
              value={content}
              onChange={contentOnChange}
              multiline
              rows={4}
              // defaultValue="Default Value"
            />
          </label>
          <Button
            variant="outlined"
            className="post-button"
            type="submit"
            sx={{ color: '#9BC2BF', borderColor: '#9BC2BF' }}
          >
            Post
          </Button>
        </form>
      )}
    </div>
  );
}

export default PostForm;
