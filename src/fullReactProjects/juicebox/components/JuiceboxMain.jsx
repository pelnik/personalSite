import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, PostForm, EditPost, Posts } from '.';
import { getPosts } from '../api-adapter';
import { useAuth } from '../../../components/Auth';
import '../../../css/juicebox.css';

function Main() {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);

  async function fetchPosts(token) {
    const allPosts = await getPosts(token);

    if (allPosts !== undefined) {
      setPosts(allPosts);
    }
  }

  useEffect(() => {
    fetchPosts(token);
  }, [token]);

  useEffect(() => {
    document.title = `JuiceBox Social - A social media site project -
      Matthew Pelnik, Data Analyst, Databricks and Spark`;
  }, []);

  return (
    <div className="jbMainContainer" id="jbMainContainer">
      <Navbar token={token} />
      <Routes>
        <Route
          path="login"
          element={<Navigate to="/login?next=/juicebox" replace />}
        />
        <Route
          path="register"
          element={<Navigate to="/login?next=/juicebox" replace />}
        />
        <Route
          path="post"
          element={<PostForm token={token} posts={posts} setPosts={setPosts} />}
        />
        <Route
          path="post/:id"
          element={<EditPost token={token} posts={posts} setPosts={setPosts} />}
        />
        <Route
          path="*"
          element={<Posts posts={posts} setPosts={setPosts} token={token} />}
        />
      </Routes>
    </div>
  );
}

export default Main;
