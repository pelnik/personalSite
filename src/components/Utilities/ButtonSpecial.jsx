import React, { useState, useRef, useEffect } from 'react';

function ButtonSpecial({ className }) {
  const [childButtonClass, setChildButtonClass] = useState('button-special');
  const [parentButtonClass, setParentButtonClass] = useState(
    'button-special-parent '
  );

  //look into passing classes from parent

  function handleMouseEnter() {
    setChildButtonClass('button-special-hover');
    setParentButtonClass('button-special-parent-hover');
  }

  function handleMouseLeave() {
    setChildButtonClass('button-special');
    setParentButtonClass('button-special-parent');
  }

  return (
    <div
      className={[parentButtonClass, 'all-button-special'].join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={[childButtonClass, className, 'all-button-special'].join(
          ' '
        )}
      >
        About
      </button>
    </div>
  );
}

export default ButtonSpecial;
