import React from "react";
import styles from "./Pagination.module.css";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className={styles.paginationContainer}>
      {pages.map((page) => (
        <button
          key={page}
          className={`${styles.pageButton} ${
            currentPage === page ? styles.active : ""
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
