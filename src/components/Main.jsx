import React from 'react';

function Main() {
  return (
    <div className="fullWindow">
      <header className="header" id="indexHeader">
        <div className="leftHeader">
          <a href="index.html">
            <div className="material-symbols-outlined">Home</div>
          </a>
          <p className="headerItems" id="myHeaderName">
            Matthew Pelnik
          </p>
        </div>
        <div className="rightHeader">
          <a className="wideHeaderItems" href="/about.html">
            <p className="headerItems" id="myAboutPage">
              About
            </p>
          </a>
          <a className="wideHeaderItems" href="/portfolio.html">
            <p className="headerItems" id="myPortfolio">
              Portfolio
            </p>
          </a>
          <a className="articleIconContainer" href="/about.html">
            <img
              className="articleIcon"
              src="/Media/main/aboutPageIcon.svg"
              id="aboutIcon"
              alt="about"
            />
          </a>
          <a className="articleIconContainer" href="/portfolio.html">
            <img
              className="articleIcon"
              src="/Media/main/article_FILL1_wght600_GRAD0_opsz48.svg"
              alt="portfolio"
            />
          </a>
        </div>
      </header>
      <main className="main" id="indexMain">
        <div className="mainContainer">
          <div id="indexTextContentContainer">
            <div className="indexTextContent">
              <h1>👋 Welcome to my page!</h1>
              <p>
                👉 My name is Matt Pelnik and welcome to my personal site. I&apos;m a
                web software engineer based out of Tulsa, OK. I have an
                engineering background with and have worked in tech, healthcare,
                and energy. Please have a look at my portfolio and about section
                to learn more about me.
              </p>
              <p>
                👉 I&apos;ve worked previously with Oracle in their healthcare group
                as a business analyst building low code automation systems. I
                wanted to move my interest to a career and code fulltime, and
                I&apos;d love to talk.
              </p>
            </div>
          </div>
          <div className="indexIMGContainer">
            <img
              src="/Media/main/Professional pic.jpg"
              className="professionalPicMain rightFlexIMG"
              alt="Matt Pelnik"
            />
          </div>
        </div>
      </main>
      <footer id="footer">
        <div id="footerIconParent">
          <a href="https://www.linkedin.com/in/mpelnik/">
            <img
              className="footerIcon"
              src="/Media/main/linkedin_icon.svg"
              alt="linkedIn"
            />
          </a>
          <a href="https://github.com/pelnik">
            <img
              className="footerIcon"
              src="/Media/main/github_icon.svg"
              alt="github"
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
    </div>
  );
}

export default Main;
