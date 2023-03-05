import React from 'react';
import '../css/site.css';

function Footer() {
  return (
    <footer id="footer">
      <div id="footerIconParent">
        <a href="https://www.linkedin.com/in/mpelnik/">
          <img
            className="footerIcon"
            src="/Media/main/linkedin_icon.svg"
            alt="linkedIn"
            target="_blank"
          />
        </a>
        <a href="https://github.com/pelnik">
          <img
            className="footerIcon"
            src="/Media/main/github_icon.svg"
            alt="github"
            target="_blank"
          />
        </a>
        <a href="tel:9187982238">
          <img
            className="footerIcon"
            src="/Media/main/phone_icon.svg"
            alt="call"
          />
        </a>
        <a href="mailto:matt@pelnik.dev">
          <img
            className="footerIcon"
            src="/Media/main/email_icon.svg"
            alt="email"
          />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
