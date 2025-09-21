// BasicInfoFields.jsx
import React, { useMemo } from "react";
import styles from "./EmployeeFormFields.module.css";

const rankOptions = [
  "Professor",
  "Senior Lecturer",
  "Assistant Lecturer",
  "Tutor",
  "Adjunct",
  "Other",
];

// ✅ FIX: if role objects arrive as {_id, name}, use NAME as value (not _id)
const toOptions = (roles) => {
  const arr = Array.isArray(roles) ? roles : [];
  return arr
    .map((r) => {
      if (typeof r === "string") return { label: r, value: r };
      if (r && typeof r === "object") {
        if ("label" in r && "value" in r) return { label: r.label, value: String(r.value) };
        if ("_id" in r && "name" in r) return { label: r.name, value: r.name }; // ← here
      }
      return null;
    })
    .filter(Boolean);
};

const BasicInfoFields = ({ formData, loading, roles, editMode, set }) => {
  const roleOptions = useMemo(() => toOptions(roles), [roles]);
  const roleValue = String(formData.role || "");

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
          value={roleValue}
          onChange={set("role")}
          disabled={loading || roleOptions.length === 0}
          className={styles.selectField}
        >
          {roleOptions.length === 0 ? (
            <option>Loading roles...</option>
          ) : (
            <>
              <option value="">-- Select Role --</option>
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </>
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
