// src/components/EmployeeForm/EmployeeFormActions.jsx
import React from 'react';
import styles from './EmployeeFormActions.module.css';

const EmployeeFormActions = ({ onClose, handleSubmit, loading }) => {
  return (
    <div className={styles.actionsContainer}>
      <button 
        type="button"
        onClick={onClose} 
        className={styles.cancelButton}
        disabled={loading}
      >
        Cancel
      </button>
      <button 
        type="submit"
        onClick={handleSubmit} 
        className={styles.saveButton}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            Processing...
          </>
        ) : 'Save'}
      </button>
    </div>
  );
};

export default EmployeeFormActions;