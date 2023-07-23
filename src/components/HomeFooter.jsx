import React from 'react';

function HomeFooter() {
  return (
    <div id="footer-parent">
      <div id="footer-grid-parent">
        <div id="middle-footer">
          <div id="middle-footer-flex">
            <div id="footer-icon-parent">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.linkedin.com/in/mpelnik/"
              >
                <img
                  className="footer-icon"
                  src="/Media/main/linkedin_icon.svg"
                  alt="linkedIn"
                />
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://github.com/pelnik"
              >
                <img
                  className="footer-icon"
                  src="/Media/main/github_icon.svg"
                  alt="github"
                />
              </a>
              <a href="tel:9187982238">
                <img
                  className="footer-icon"
                  src="/Media/main/phone_icon.svg"
                  alt="call"
                />
              </a>
              <a href="mailto:matt@pelnik.dev">
                <img
                  className="footer-icon"
                  src="/Media/main/email_icon.svg"
                  alt="email"
                />
              </a>
            </div>
            <div id="contact-info">
              <h3 id="contact-title-footer">Contact</h3>
              <p>Email: matthew.pelnik@gmail.com</p>
              <p>Phone: (918) 798-2238</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeFooter;
