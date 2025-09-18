import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faArrowLeft, 
  faSearch,
  faCompass
} from '@fortawesome/free-solid-svg-icons';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        {/* Animated background elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.floatingCircle}></div>
          <div className={styles.floatingCircle} style={{ animationDelay: '1s' }}></div>
          <div className={styles.floatingCircle} style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Main content */}
        <div className={styles.glassCard}>
          <div className={styles.errorCode}>
            <span className={styles.number}>4</span>
            <span className={styles.number}>0</span>
            <span className={styles.number}>4</span>
          </div>
          
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.subtitle}>
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>
          
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.actionButtons}>
            <Link to="/" className={styles.button}>
              <FontAwesomeIcon icon={faHome} />
              <span>Go Home</span>
            </Link>
            <button onClick={() => window.history.back()} className={styles.button}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Go Back</span>
            </button>
          </div>
          
          <div className={styles.suggestion}>
            <FontAwesomeIcon icon={faCompass} className={styles.compassIcon} />
            <p>Or explore our site navigation to find what you need</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;