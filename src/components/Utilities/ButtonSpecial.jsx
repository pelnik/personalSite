import React, { useState, useRef, useEffect } from 'react';

function ButtonSpecial() {
  const parentRef = useRef({});
  const buttonRef = useRef({});

  const parentOriginalPadding = useRef(0);
  const buttonOriginalPadding = useRef(0);

  const [parentPadding, setParentPadding] = useState(null);
  const [buttonPadding, setButtonPadding] = useState(null);

  function buttonSpecialClick(evt) {}

  function updateEachPadding(objectToUpdate, paddingObject) {
    const tempObject = {};
    tempObject.paddingTop = paddingObject.paddingTop;
    tempObject.paddingRight = paddingObject.paddingRight;
    tempObject.paddingBottom = paddingObject.paddingBottom;
    tempObject.paddingLeft = paddingObject.paddingLeft;

    console.log('objectToUpdate', objectToUpdate);
    objectToUpdate.current = tempObject;
    console.log('objectToUpdate', objectToUpdate);
  }

  function addStyle(padding) {
    const styleObject = {};
    styleObject.backgroundColor = 'yellow';

    if (padding) {
      styleObject.paddingTop = padding.paddingTop;
      styleObject.paddingRight = padding.paddingRight;
      styleObject.paddingBottom = padding.paddingBottom;
      styleObject.paddingLeft = padding.paddingLeft;
    }

    return styleObject;
  }

  function handleMouseEnter() {
    setParentPadding({});
  }

  useEffect(() => {
    updateEachPadding(
      parentOriginalPadding,
      window.getComputedStyle(parentRef.current)
    );

    updateEachPadding(
      buttonOriginalPadding,
      window.getComputedStyle(buttonRef.current)
    );
  }, []);

  return (
    <div
      onClick={buttonSpecialClick}
      ref={parentRef}
      className="button-special"
      style={addStyle(parentPadding)}
      onMouseEnter={handleMouseEnter}
    >
      <button
        ref={buttonRef}
        className="navbar-button"
        style={addStyle(buttonPadding)}
      >
        About
      </button>
    </div>
  );
}

export default ButtonSpecial;
