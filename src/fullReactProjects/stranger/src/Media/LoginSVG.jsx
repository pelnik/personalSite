import * as React from "react";

const SvgComponent = (props) => (
  <svg viewBox="0 0 32 32" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" height="100%" {...props}>
    <defs>
      <style>
        {
          ".cls-1{fill:#FFFFFF;stroke:#FFFFFF;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px}"
        }
      </style>
    </defs>
    <title />
    <g id="login">
      <path fill="#FFFFFF" className="cls-1" d="M29 16H16" />
      <path fill="#FFFFFF" d="M24 25v3H8V4h16v3h2V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v26a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4Z" />
      <path className="cls-1" d="m16 16 4-4M16 16l4 4M25 8V6M25 26v-2" />
    </g>
  </svg>
);

export default SvgComponent;
