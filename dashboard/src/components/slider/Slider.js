import React, { useState, useEffect,useCallback } from 'react';
import styles from './Slider.module.css'; // Make sure this path matches your file structure

const Slider = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent(current => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  if (!Array.isArray(images) || images.length <= 0) {
    return null; // Return null if no images are provided
  }

  return (
    <div className={styles.slider}>
      {images.map((image, index) => (
        <div
          className={index === current ? styles.slideActive : styles.slide}
          key={index}
        >
          {index === current && (
            <img src={image} alt={`Slide ${index}`} className={styles.image} />
          )}
        </div>
      ))}
      <button className={styles.prev} onClick={() => setCurrent(current === 0 ? images.length - 1 : current - 1)}>‹</button>
      <button className={styles.next} onClick={() => setCurrent(current === images.length - 1 ? 0 : current + 1)}>›</button>
    </div>
  );
};

export default Slider;
