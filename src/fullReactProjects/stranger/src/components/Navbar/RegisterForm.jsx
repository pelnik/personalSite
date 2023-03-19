import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api-adapter";

function RegisterForm({ userToken, alert, setAlert }) {
  const [typedUsername, setTypedUsername] = useState("");
  const [typedPassword, setTypedPassword] = useState("");
  const [typedConfirmPassword, setTypedConfirmPassword] = useState("");
  const [passwordNotMatching, setPasswordNotMatching] = useState(false);

  const navigate = useNavigate();

  async function registerUserToken() {
    try {
      const user = {
        username: typedUsername,
        password: typedPassword,
      };

      const response = await register(user);
      const success = response.success;

      if (success === false) {
        if (response.error.name === "UserExists") {
          setAlert({
            ...alert,
            userAlreadyRegistered: true,
          });
          navigate("/login");
        } else {
          throw new Error("Unknown Register API failure. See console log.");
        }
      } else if (success === true) {
        const token = response.data.token;

        setAlert({
          ...alert,
          userJustRegistered: true,
        });
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (userToken) {
      setAlert({
        ...alert,
        userLoggedInRegister: true,
      });
      navigate("/login");
    }
  }, [userToken]);

  function onChangeHandler(evt, setState) {
    setState(evt.target.value);
  }

  function onSubmitHandler(evt) {
    evt.preventDefault();

    if (typedPassword === typedConfirmPassword) {
      registerUserToken();

      setTypedUsername("");
      setTypedPassword("");
      setTypedConfirmPassword("");
      setPasswordNotMatching(false);
    } else {
      setPasswordNotMatching(true);
    }
  }

  return (
    userToken !== null
      ? <p>You're already logged in!</p>
      : <div id="loginFormParent">
        {passwordNotMatching ? (
          <p id="passwordNotMatching">
            Please enter the same value in each password field
          </p>
        ) : null}
        <form onSubmit={onSubmitHandler} id="loginFormContainer">
          <div className="login-input-container" id="loginUsernameContainer">
            <label>Username:</label>
            <input
              type="text"
              id="loginUsername"
              name="loginUsername"
              required="required"
              minLength="5"
              value={typedUsername}
              onChange={(evt) => {
                onChangeHandler(evt, setTypedUsername);
              }}
            />
          </div>
          <div className="login-input-container" id="loginPasswordContainer">
            <label>Password:</label>
            <input
              type="password"
              id="loginPassword"
              name="loginPassword"
              required="required"
              autoComplete="on"
              value={typedPassword}
              minLength="8"
              onChange={(evt) => {
                onChangeHandler(evt, setTypedPassword);
              }}
            />
          </div>
          <div className="login-input-container" id="confirmPasswordContainer">
            <label>Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required="required"
              autoComplete="on"
              value={typedConfirmPassword}
              onChange={(evt) => {
                onChangeHandler(evt, setTypedConfirmPassword);
              }}
            />
          </div>
          <div className="login-input-container" id="loginSubmitContainer">
            <input type="submit" value="Register" />
          </div>
        </form>
        <Link to='/'><p id="header-x">x</p></Link>
      </div>
  );
}

export default RegisterForm;
