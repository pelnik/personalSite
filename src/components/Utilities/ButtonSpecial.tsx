import React, { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonSpecialProps {
  className?: string;
  handleClick?: () => void;
  // Renders a link instead of a button, so the destination is a real href.
  to?: string;
  children: ReactNode;
}

function ButtonSpecial({
  className,
  handleClick,
  to,
  children,
}: ButtonSpecialProps) {
  const [childButtonClass, setChildButtonClass] = useState('button-special');
  const [parentButtonClass, setParentButtonClass] = useState(
    'button-special-parent '
  );

  function handleMouseEnter() {
    setChildButtonClass('button-special-hover');
    setParentButtonClass('button-special-parent-hover');
  }

  function handleMouseLeave() {
    setChildButtonClass('button-special');
    setParentButtonClass('button-special-parent');
  }

  const childClassName = [childButtonClass, className, 'all-button-special'].join(
    ' '
  );

  return (
    <div
      className={[parentButtonClass, 'all-button-special'].join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick || undefined}
    >
      {to ? (
        <Link to={to} className={childClassName}>
          {children}
        </Link>
      ) : (
        <button className={childClassName}>{children}</button>
      )}
    </div>
  );
}

export default ButtonSpecial;
