import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { loginUser } from "../../actions/authAction";
import { set_Alert } from "../../actions/alertAction";
import Alert from "../../UI/alert/Alert";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError 
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alert = useSelector((state) => state.alert);

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const response = await dispatch(loginUser(data));
      if (response?.success) {
        dispatch(set_Alert("Login successful", "success"));
        navigate("/admin/kpis");
      } else {
        setError("email", { type: "manual", message: "Invalid credentials" });
        setError("password", { type: "manual", message: " " });
        dispatch(set_Alert("Invalid email or password", "error"));
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(set_Alert("An error occurred. Please try again.", "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Animated Background Section */}
      <motion.div 
        className={styles.leftSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.logoContainer}>
          <motion.div 
            className={styles.logo}
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            GIMPA
          </motion.div>
          <motion.p 
            className={styles.tagline}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Excellence in Leadership Development
          </motion.p>
        </div>
      </motion.div>

      {/* Form Section */}
      <div className={styles.rightSection}>
        <motion.form 
          className={styles.loginForm}
          onSubmit={handleSubmit(handleLogin)}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {alert?.message && (
            <Alert />
          )}

          <h2 className={styles.formTitle}>Welcome Back</h2>
          <p className={styles.formSubtitle}>Sign in to your account</p>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={`${styles.inputWrapper} ${errors.email ? styles.error : ''}`}>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={styles.inputField}
                placeholder="your.email@gimpa.edu.gh"
                autoComplete="username"
              />
              {errors.email && (
                <span className={styles.errorText}>
                  <i className={`${styles.errorIcon} fas fa-exclamation-circle`}></i>
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={`${styles.inputWrapper} ${errors.password ? styles.error : ''}`}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={styles.inputField}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              {errors.password && errors.password.message !== " " && (
                <span className={styles.errorText}>
                  <i className={`${styles.errorIcon} fas fa-exclamation-circle`}></i>
                  {errors.password.message}
                </span>
              )}
            </div>
            <div className={styles.forgotPassword}>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
          </div>

          <motion.button 
            type="submit" 
            className={styles.loginButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                Sign In
                <i className={`${styles.buttonIcon} fas fa-arrow-right`}></i>
              </>
            )}
          </motion.button>

          <p className={styles.signupPrompt}>
            Don't have an account?{" "}
            <Link to="/signup" className={styles.signupLink}>
              Create one
            </Link>
          </p>

          <div className={styles.divider}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerText}>or</span>
            <span className={styles.dividerLine}></span>
          </div>

          <button type="button" className={styles.googleButton}>
            <i className={`${styles.googleIcon} fab fa-google`}></i>
            Sign in with Google
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default LoginPage;
