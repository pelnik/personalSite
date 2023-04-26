import React, { useState, useRef } from 'react';

function ProjectImages({ project, projectWidth }) {
  const images = project.img;

  const [activeImages, setActiveImages] = useState(
    images.map((image, idx) => {
      return idx === 0;
    })
  );
  const imageRef = useRef(new Map());

  console.log('active images', activeImages);

  function scrollToImageIdx(idx) {
    const map = imageRef.current;
    const node = map.get(idx);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
    setActiveImages(
      [...activeImages].map((image, newIdx) => {
        return (idx = newIdx);
      })
    );
  }

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
