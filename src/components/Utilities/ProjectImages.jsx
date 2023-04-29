import React, { useState, useRef } from 'react';

function ProjectImages({ project, projectWidth }) {
  const images = project.img;

  const activeImages = useRef(
    images.map((image, idx) => {
      return idx === 0;
    })
  );
  const imageRef = useRef(new Map());
  const scrollingInterval = useRef([]);
  console.log('each render active image', activeImages);

  function scrollToImageIdx(idx) {
    const map = imageRef.current;
    const node = map.get(idx);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });

    console.log(
      'new array to set ',
      activeImages.current.map((image, newIdx) => {
        return idx === newIdx;
      })
    );

    activeImages.current = [...activeImages.current].map((image, newIdx) => {
      return idx === newIdx;
    });
  }

  function getCurrentImage() {
    console.log('activeImages inside of getCurrent', activeImages.current);
    console.log(
      'get current image',
      activeImages.current.findIndex((imageActive) => imageActive)
    );
    return activeImages.current.findIndex((imageActive) => imageActive);
  }

  const onMouseEnter = (evt) => {
    const intervalID = setInterval(() => {
      console.log('hover scope active images', activeImages.current);
      const currentIdx = getCurrentImage();
      const nextIdx =
        currentIdx + 1 > activeImages.current.length - 1 ? 0 : currentIdx + 1;

      console.log('next idx, passed into funtion', nextIdx);

      scrollToImageIdx(nextIdx);
    }, 2000);
    scrollingInterval.current.push(intervalID);
  };

  const onMouseLeave = (evt) => {
    scrollingInterval.current.forEach((intervalID) => {
      clearInterval(intervalID);
    });

    scrollingInterval.current = [];
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="img-container"
    >
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
