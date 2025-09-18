import React from 'react';
import styles from './Pagination.module.css'; // Create this CSS module for styling

const PaginationControls = ({ currentPage, totalPages, onNext, onPrev }) => {
  return (
    <div className={styles.paginationContainer}>
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className={styles.paginationButton}
      >
        Previous
      </button>
      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={styles.paginationButton}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
