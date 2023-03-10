import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patchPost } from '../api-adapter';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function EditPost(props) {
  const token = props.token;
  const posts = props.posts;
  const setPosts = props.setPosts;

  let { id } = useParams();
  id = Number(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const post = posts.find((singlePost, idx) => {
    singlePost.idx = idx;
    return singlePost.id === id;
  });

  const titleOnChange = (evt) => {
    setTitle(evt.target.value);
  };

  const contentOnChange = (evt) => {
    setContent(evt.target.value);
  };

  function onClickLogIn(evt) {
    navigate('/juicebox/login');
  }

  function noPostComp() {
    return posts.length > 0 ? <div>Not a post</div> : <div>Loading</div>;
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const editedPost = await patchPost(token, id, title, content);

    if (editedPost) {
      const updatedPosts = [...posts];
      updatedPosts[post.idx] = editedPost;
      setPosts(updatedPosts);

      setTitle('');
      setContent('');

      navigate('/juicebox/');
    }
  };

  useEffect(() => {
    if (post && !post.isAuthor) {
      navigate('/juicebox');
    } else if (post) {
      setTitle(post.title);
      setContent(post.content);
    } else if (posts.length > 0) {
      navigate('/juicebox');
    }
  }, [posts]);

  return (
    <div className="formContainer" id="post">
      {!post ? (
        noPostComp()
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <h1>Update Your Post</h1>
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
            />
          </label>
          {token ? (
            <Button
              variant="outlined"
              className="post-button"
              type="submit"
              sx={{ color: '#9BC2BF', borderColor: '#9BC2BF' }}
            >
              Post
            </Button>
          ) : (
            <Button
              onClick={onClickLogIn}
              variant="outlined"
              className="post-button"
              sx={{ color: '#9BC2BF', borderColor: '#9BC2BF' }}
            >
              Please Log In
            </Button>
          )}
        </form>
      )}
    </div>
  );
}

export default EditPost;
