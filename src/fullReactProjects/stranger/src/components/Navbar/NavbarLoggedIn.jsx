import React from 'react';
import { Link, useNavigate } from'react-router-dom';
import { removeLocalStorageToken } from'../../utils';
import { LogoutSVG, MessageSVG, Compose2 } from '../../Media';


function NavbarLoggedIn({setUserToken}) {
  const navigate = useNavigate();

  function onClickLogout() {
    removeLocalStorageToken();
    setUserToken(null);
    navigate('/');
  }

  return (
    <div className="generic-flex-row" id="navbar-logged-in">
      <div className="generic-flex-row" id="logged-in-actions">
        <Link to="/profile">
          <div className="icon-wrapper">
            <MessageSVG />
            <p>Messages</p>
          </div>
        </Link>
        <Link to="/submit">
          <div className="icon-wrapper">
            <Compose2 height="100%" />
            <p>Submit</p>
          </div>
        </Link>
      </div>
      <button onClick={onClickLogout} className="navbar-icons">
        <div className="icon-wrapper">
          <LogoutSVG />
          <p>Logout</p>
        </div>
      </button>
    </div>
  )
}


export default NavbarLoggedIn;