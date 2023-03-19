import React, { useState, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { RegisterForm, NavbarNotLoggedIn, NavbarLoggedIn, LoginForm } from "..";
import { HomeSVG, Search } from '../../Media';

function Navbar({ userToken, setUserToken, setPostFilter }) {
  const [alert, setAlert] = useState({
    userLoggedInRegister: false,
    userAlreadyRegistered: false,
    userJustRegistered: false,
  });

  const inputRef = useRef(null);
  const iconFill = "#FFFFF"

  function clearAlerts() {
    const alertCopy = { ...alert };
    for (const key in alertCopy) {
      alertCopy[key] = false;
    }

    setAlert(alertCopy);
  }

  const onSearchChange = (evt) => {
    setPostFilter(evt.target.value.toLowerCase());
  };

  function returnAlertElement(alert) {
    if (alert.userLoggedInRegister) {
      return (
        <p>You're already logged in! Log out to login/register another user</p>
      );
    } else if (alert.userAlreadyRegistered) {
      return <p>You're already registered! Please log in</p>;
    } else if (alert.userJustRegistered) {
      return <p>You're registered! Please login</p>;
    }

    return null;
  }

  return (
    <div id="Navbar">
      <div id="leftNavbar">
        <Link to="/">
          <div className="icon-wrapper">
            <HomeSVG fill="#FFFFFF" />
            <p>Home</p>
          </div>
        </Link>
        <div id="searchContainer" onClick={() => {inputRef.current.focus()}}>
          <Search fill="#99D1FF" height="100%" />
          <input type="search" id="postFilter" onChange={onSearchChange} ref={inputRef}></input>
        </div>
      </div>
      <div id="rightNavbar" onClick={clearAlerts}>
        {returnAlertElement(alert)}
        <Routes>
          <Route
            path="/"
            element={
              userToken ? (
                <NavbarLoggedIn
                  setUserToken={setUserToken}
                />
              ) : (
                <NavbarNotLoggedIn />
              )
            }
          />
          <Route
            path="/register"
            element={
              <RegisterForm
                userToken={userToken}
                setUserToken={setUserToken}
                alert={alert}
                setAlert={setAlert}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginForm
                userToken={userToken}
                setUserToken={setUserToken}
                alert={alert}
                setAlert={setAlert}
              />
            }
          />
          <Route
            path="*"
            element={
              userToken ? (
                <NavbarLoggedIn
                  userToken={userToken}
                  setUserToken={setUserToken}
                />
              ) : (
                <NavbarNotLoggedIn iconFill={iconFill}/>
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default Navbar;
