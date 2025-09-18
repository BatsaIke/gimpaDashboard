import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { set_Alert } from "../../../actions/alertAction";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../actions/authAction";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!text || !password) {
      dispatch(set_Alert("All fields are required", "error"));
      return;
    }
    setLoading(true);
    const result = await dispatch(loginUser({ text, password }));
    setLoading(false);

    if (result.success) {
      dispatch(set_Alert("Login successful", "success"));
      navigate("/");
    } else {
      dispatch(set_Alert("Invalid credentials", "error"));
    }
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className={styles.loginBox}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className={styles.header}>
          <h2>Welcome Back</h2>
          <p>Sign in to your employee account</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <motion.div 
            className={`${styles.inputGroup} ${isFocused.email ? styles.focused : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            <label><FontAwesomeIcon icon={faUser} /> Email/Phone</label>
            <input
              type="text"
              placeholder="Enter email or phone"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused({...isFocused, email: true})}
              onBlur={() => setIsFocused({...isFocused, email: false})}
            />
          </motion.div>

          <motion.div 
            className={`${styles.inputGroup} ${isFocused.password ? styles.focused : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            <label><FontAwesomeIcon icon={faLock} /> Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsFocused({...isFocused, password: true})}
              onBlur={() => setIsFocused({...isFocused, password: false})}
            />
          </motion.div>

          <motion.button 
            type="submit" 
            className={styles.loginButton} 
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className={styles.loadingDots}>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            ) : (
              <>
                Login <FontAwesomeIcon icon={faArrowRight} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;