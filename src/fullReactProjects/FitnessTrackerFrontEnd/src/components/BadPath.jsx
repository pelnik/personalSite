import React from 'react';

function BadPath() {
  return (
    <div className="main-content main-layout">
      <h1>404: Incorrect URL</h1>
      <div>
        😧 Oh no, that path doesn't exist. Click one of the buttons above to get
        back to the right place.{' '}
      </div>
    </div>
  );
}

export default BadPath;
