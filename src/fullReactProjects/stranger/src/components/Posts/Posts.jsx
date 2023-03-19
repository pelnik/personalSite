import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { getPosts, getMyData } from "../../api-adapter";
import { IndividualPost, PostSubmission, Messages } from "..";
import { Logo } from "../../Media";

function Posts({ userToken, postFilter }) {
  const [posts, setPosts] = useState([]);
  const [myData, setMyData] = useState({
    messages: [],
  });

  const callGetPosts = async () => {
    try {
      const response = await getPosts(userToken);
      const posts = response.data.posts;

      setPosts(posts);
    } catch (error) {
      console.error(error);
    }
  };

  async function setMyDataApi(token) {
    try {
      if (token !== null) {
        const result = await getMyData(token);

        if (result.success === true) {
          setMyData(result.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    callGetPosts();
    setMyDataApi(userToken);
  }, [userToken]);

  return (
    <div id="mainContent">
      <div id="post-page-container">
        <div className="generic-flex-row" id="post-header-container">
          <div id="logo-container">
            <Logo height="100%"/>
          </div>
          <h1 id="post-header">Stranger's Things</h1>
        </div>
        <div id="all-posts-plus-attribution">
          <div id="all-posts">
            {[...posts]
              .filter((post) => {
                return (
                  post.title.toLowerCase().includes(postFilter) ||
                  post.description.toLowerCase().includes(postFilter) ||
                  post.price.toLowerCase().includes(postFilter) ||
                  post.author.username.toLowerCase().includes(postFilter)
                );
              })
              .reverse()
              .map((post) => {
                return (
                  <IndividualPost
                    key={`post: ${post._id}`}
                    postData={post}
                    userToken={userToken}
                    posts={posts}
                    setPosts={setPosts}
                    setMyDataApi={setMyDataApi}
                  />
                );
              })}
          </div>
          <p id="attribution">
            Icon attribution to: https://handdrawngoods.com, Sabr Studio of iconfinder.com, https://elements.envato.com/all-items/deemakdaksinas,
            papergarden of iconfinder.com, https://creativemarket.com/eucalyp, and https://creativemarket.com/BomSymbols
          </p>
        </div>
      </div>
      <Routes>
        <Route
          path="/profile"
          element={<Messages userToken={userToken} myData={myData} />}
        />
        <Route
          path="/submit"
          element={<PostSubmission
            userToken={userToken}
            posts={posts}
            setPosts={setPosts}
          />}
        />
        <Route path="*" element={null} />
      </Routes>
    </div>
  );
}

export default Posts;
