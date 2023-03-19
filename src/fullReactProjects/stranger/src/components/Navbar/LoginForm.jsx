import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api-adapter";
import { writeLocalStorageToken } from "../../utils";

function LoginForm({ userToken, setUserToken, alert, setAlert }) {
  const [typedUsername, setTypedUsername] = useState("");
  const [typedPassword, setTypedPassword] = useState("");
  const [wrongLogin, setWrongLogin] = useState(false);

  const navigate = useNavigate();

  async function loginUserToken() {
    try {
      const user = {
        username: typedUsername,
        password: typedPassword,
      };

      const response = await login(user);
      const success = response.success;

      if (success === false) {
        if (response.error.name === "InvalidCredentials") {
          setWrongLogin(true);
        } else {
          console.error(response)
        }
      } else if (success === true) {
        const token = response.data.token;

        setUserToken(token);
        writeLocalStorageToken(token);
        navigate("/");
      }
    } catch (error) {
      console.error(error, response);
    }
  }

  useEffect(() => {
    if (userToken) {
      setAlert({
        ...alert,
        userLoggedInRegister: true,
      });
      navigate("/");
    }
  }, [userToken]);

  function onChangeHandler(evt, setState) {
    setState(evt.target.value);
  }

  function onSubmitHandler(evt) {
    evt.preventDefault();

    loginUserToken();

    setTypedUsername("");
    setTypedPassword("");
  }

  function onClickParent() {
    setWrongLogin(false);
  }

  return (
    userToken !== null
    ? <p>You're already logged in!</p>
    : <div className="login-input-container" id="loginFormParent" onClick={onClickParent}>
        {
          wrongLogin
          ? <p>Wrong username or password. Please try again.</p>
          : null
        }
        <form className="login-input-container" onSubmit={onSubmitHandler} id="loginFormContainer">
          <div id="loginUsernameContainer">
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
          <div id="loginSubmitContainer">
            <input type="submit" value="Login" />
          </div>
        </form>
        <Link to='/'><p id="header-x">x</p></Link>
      </div>
  );
}

export default LoginForm;
