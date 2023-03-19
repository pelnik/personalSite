import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar, Posts } from '.';
import { checkLocalStorageToken } from '../utils';
import '../../../../css/stranger.css';

function Main() {
  const [userToken, setUserToken] = useState(null);
  const [postFilter, setPostFilter] = useState('');

  useEffect(() => {
    setUserToken(checkLocalStorageToken());
  }, []);

  useEffect(() => {}, [userToken]);

  return (
    <div id="strangerMain">
      <Navbar
        userToken={userToken}
        setUserToken={setUserToken}
        setPostFilter={setPostFilter}
      />
      <Routes>
        <Route
          path="*"
          element={
            <Posts
              userToken={userToken}
              setUserToken={setUserToken}
              postFilter={postFilter}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default Main;
