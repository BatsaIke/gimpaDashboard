// src/pages/ChangePasswordPage.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./ChangePasswordPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

/**
 * We'll assume we have an action updateUserPassword(userId, { oldPassword, newPassword })
 * that calls the backend route e.g. PATCH /users/:id 
 * or POST /auth/change-password
 */
import { set_Alert } from "../../../actions/alertAction";
import { changeEmployeePassword } from "../../../actions/employeeActions";

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      dispatch(set_Alert("All fields are required", "error"));
      return;
    }

    // call the updateUserPassword with your chosen route
    const result = await dispatch(
      changeEmployeePassword( { oldPassword, newPassword })
    );
    if (result.success) {
      dispatch(set_Alert("Password changed successfully", "success"));
      setOldPassword("");
      setNewPassword("");
    } else {
      dispatch(set_Alert("Failed to change password", "error"));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword} className={styles.form}>
          <div className={styles.inputGroup}>
            <label><FontAwesomeIcon icon={faLock} /> Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label><FontAwesomeIcon icon={faLock} /> New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          <button type="submit" className={styles.saveButton}>Save</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
