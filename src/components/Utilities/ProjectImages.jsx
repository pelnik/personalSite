import React from 'react';

function ProjectImages({ project, projectWidth, imageRef, images }) {
  console.log('projectImages', images);

  return (
    <div className="img-container">
      <div className="img-scrolling">
        {images.map((image, idx) => {
          return (
            <div
              className="individual-image"
              key={idx}
              style={{
                width: projectWidth,
              }}
              ref={(node) => {
                const map = imageRef.current;
                if (node) {
                  map.set(idx, node);
                } else {
                  map.delete(idx);
                }
              }}
            >
              <img src={image.url} alt={image.alt} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectImages;
