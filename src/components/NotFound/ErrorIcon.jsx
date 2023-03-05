import * as React from 'react';

function ErrorIcon() {
  return (
    <svg
      style={{
        enableBackground: 'new 0 0 30 30',
      }}
      viewBox="0 0 30 30"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      height="2.5rem"
    >
      <circle fill="#C26D63" cx={26} cy={24} r={2} />
      <path
        fill="#C26D63"
        d="M17 5c0 1.105-.895 1-2 1s-2 .105-2-1 .895-2 2-2 2 .895 2 2z"
      />
      <circle fill="#C26D63" cx={4} cy={24} r={2} />
      <path
        fill="#C26D63"
        d="M16.836 4.21 15 4l-1.836.21L2.3 22.948 4.144 26h21.712l1.844-3.052L16.836 4.21zm-.624 7.15-.2 6.473h-2.024l-.2-6.473h2.424zm-1.209 10.829c-.828 0-1.323-.441-1.323-1.182 0-.755.494-1.196 1.323-1.196.822 0 1.316.441 1.316 1.196 0 .741-.494 1.182-1.316 1.182z"
      />
    </svg>
  );
}

export default ErrorIcon;
