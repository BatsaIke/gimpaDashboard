// src/components/EmployeeForm/EmployeeFormFields.jsx
import React from 'react';
import styles from './EmployeeFormFields.module.css';

const EmployeeFormFields = ({
  formData,
  handleChange,
  loading,
  roles,
  rankOptions,
  departments
}) => {
  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Username<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
          className={styles.inputField}
          placeholder="Enter username"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          className={styles.inputField}
          placeholder="Enter email"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
          className={styles.inputField}
          placeholder="Enter phone number"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={loading || !roles.length}
          className={styles.selectField}
        >
          {!roles.length ? (
            <option>Loading roles...</option>
          ) : (
            roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))
          )}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Rank</label>
        <select
          name="rank"
          value={formData.rank}
          onChange={handleChange}
          disabled={loading}
          className={styles.selectField}
        >
          <option value="">-- Select Rank --</option>
          {rankOptions.map((rank) => (
            <option key={rank} value={rank}>
              {rank}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Department</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          disabled={loading}
          className={styles.selectField}
        >
          <option value="">-- Select Department --</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EmployeeFormFields;
