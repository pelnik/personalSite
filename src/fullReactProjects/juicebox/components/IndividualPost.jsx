import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Tooltip from '@mui/joy/Tooltip';

import { deletePost } from '../api-adapter';

function IndividualPost(props) {
  const post = props.post;
  const posts = props.posts;
  const setPosts = props.setPosts;
  const token = props.token;

  const navigate = useNavigate();

  async function deleteOnClick(evt) {
    const deletedPost = await deletePost(token, post.id);

    if ('id' in deletedPost) {
      let postsCopy = [...posts];
      postsCopy = postsCopy.filter((post) => {
        return post.id !== deletedPost.id;
      });

      setPosts(postsCopy);
    }
  }

  function onClickEdit(evt) {
    navigate(`/juicebox/post/${post.id}`);
  }

  return (
    <div className="individualPost">
      <div className="post-content">
        <h1>{post.title}</h1>
        <p className="content">{post.content}</p>
        <p className="author">
          by: <strong>{post.author.name}</strong>
        </p>
      </div>
      {post.isAuthor ? (
        <div className="postButtonContainer">
          <Button
            onClick={onClickEdit}
            className="edit-button post-button"
            sx={{ backgroundColor: '#5D78C2' }}
          >
            Edit
          </Button>
          <Tooltip title="Delete">
            <IconButton
              className="post-button"
              onClick={deleteOnClick}
              sx={{ backgroundColor: '#5D78C2' }}
            >
              <DeleteIcon size="medium" sx={{ color: 'white' }} />
            </IconButton>
          </Tooltip>
        </div>
      ) : null}
    </div>
  );
}

export default IndividualPost;
