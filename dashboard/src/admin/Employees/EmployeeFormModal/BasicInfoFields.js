import React from "react";
import styles from "./EmployeeFormFields.module.css";

const rankOptions = [
  "Professor",
  "Senior Lecturer",
  "Assistant Lecturer",
  "Tutor",
  "Adjunct",
  "Other",
];

const BasicInfoFields = ({ formData, loading, roles, editMode, set }) => {
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Username<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={set("username")}
          required
          disabled={loading}
          className={styles.inputField}
          placeholder="Enter username"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={set("fullName")}
          disabled={loading}
          className={styles.inputField}
          placeholder="Enter full name"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={set("email")}
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
          onChange={set("phone")}
          disabled={loading}
          className={styles.inputField}
          placeholder="Enter phone number"
        />
      </div>

      {!editMode && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Password (optional)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={set("password")}
            disabled={loading}
            className={styles.inputField}
            placeholder="Leave blank for default"
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={set("role")}
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
          onChange={set("rank")}
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
    </>
  );
};

export default BasicInfoFields;
