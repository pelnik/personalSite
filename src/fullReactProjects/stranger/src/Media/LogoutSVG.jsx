import * as React from "react"

const SvgComponent = (props) => (
  <svg viewBox="0 0 32 32" height="100%" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <style>
        {
          ".cls-1{fill:#FFFFFF;stroke:#FFFFFF;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px}"
        }
      </style>
    </defs>
    <title />
    <g id="logout">
      <path className="cls-1" d="M15.92 16h13" />
      <path fill="#FFFFFF" d="M23.93 25v3h-16V4h16v3h2V3a1 1 0 0 0-1-1h-18a1 1 0 0 0-1 1v26a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4Z" />
      <path
        className="cls-1"
        d="m28.92 16-4 4M28.92 16l-4-4M24.92 8.09v-2M24.92 26v-2"
      />
    </g>
  </svg>
)

export default SvgComponent
