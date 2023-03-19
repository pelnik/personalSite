import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Messages({ userToken, myData }) {
  const [buttonValue, setButtonValue] = useState("Received");
  const [buttonText, setButtonText] = useState("See Sent Messages");

  const navigate = useNavigate();

  function onClickMode() {
    if (buttonValue === "Received") {
      setButtonValue("Sent");
      setButtonText("See Received Messages");
    }
    if (buttonValue === "Sent") {
      setButtonValue("Received");
      setButtonText("See Sent Messages");
    }
  }

  function filterMessages(message) {
    if (buttonValue === "Received") {
      return message.fromUser._id !== myData._id;
    } else if (buttonValue === "Sent") {
      return message.fromUser._id === myData._id;
    }
  }
  function onClickClose() {
    navigate("/");
  }

  return userToken ? (
    <div className="sidebar">
      <div className="sidebar-content-container" id="message-container">
      <button onClick={onClickClose} className="sidebar-close">
        x
      </button>
        <h2 className="sidebar-header" id="messages-header">Messages</h2>
        <div id="message-buttons">
          <button onClick={onClickMode} id="message-button" value={buttonValue}>
            {buttonText}
          </button>
        </div>
        {myData.messages
          .filter(filterMessages)
          .reverse()
          .map((message, idx) => {
            return (
              <div
                className="individual-message"
                key={`messages: ${message._id} ${idx}`}
              >
                <p>From: {message.fromUser.username}</p>
                <p>For your post: {message.post.title}</p>
                <p>Message: {message.content}</p>
              </div>
            );
          })}
      </div>
    </div>
  ) : null;
}

export default Messages;
