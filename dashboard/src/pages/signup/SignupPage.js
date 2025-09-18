import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link,} from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {  signupSuperAdmin } from "../../actions/authAction";
import { set_Alert } from "../../actions/alertAction";
import Spinner from "../../UI/Spinner";
import styles from "./SignupPage.module.css";

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm();
  const dispatch = useDispatch();
  const password = watch("password");

  const onSubmit = async (data) => {
  setLoading(true);
  try {
    const signupData = { ...data, role: "Super Admin" };
    const response = await dispatch(signupSuperAdmin(signupData));
    if (response.success === true) {
      dispatch(set_Alert("Super Admin created successfully. Please log in.", "success"));
      // navigate("/login");
    }
  } catch (error) {
    console.error("Signup error:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={styles.signupContainer}>
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
        {loading ? (
          <div className={styles.spinnerContainer}>
            <Spinner />
          </div>
        ) : (
          <motion.form 
            className={styles.signupForm}
            onSubmit={handleSubmit(onSubmit)}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className={styles.formTitle}>Create Super Admin Account</h2>
            <p className={styles.formSubtitle}>Enter your details to get started</p>

            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Full Name</label>
              <div className={`${styles.inputWrapper} ${errors.fullName ? styles.error : ''}`}>
                <input
                  type="text"
                  id="fullName"
                  {...register("fullName", { 
                    required: "Full name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters"
                    }
                  })}
                  className={styles.inputField}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <span className={styles.errorText}>
                    <i className={`${styles.errorIcon} fas fa-exclamation-circle`}></i>
                    {errors.fullName.message}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
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
                  placeholder="example@gimpa.edu.gh"
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
                  type="password"
                  id="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: {
                      hasNumber: value => /[0-9]/.test(value) || "At least one number",
                      hasSpecialChar: value => 
                        /[!@#$%^&*(),.?":{}|<>]/.test(value) || 
                        "At least one special character",
                    }
                  })}
                  className={styles.inputField}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <span className={styles.errorText}>
                    <i className={`${styles.errorIcon} fas fa-exclamation-circle`}></i>
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div className={styles.passwordStrength}>
                <div 
                  className={`${styles.strengthBar} ${
                    password?.length > 0 && password?.length < 4 ? styles.weak : 
                    password?.length >= 4 && password?.length < 8 ? styles.medium : 
                    password?.length >= 8 ? styles.strong : ''
                  }`}
                ></div>
                <span className={styles.strengthText}>
                  {password?.length > 0 && password?.length < 4 ? 'Weak' : 
                   password?.length >= 4 && password?.length < 8 ? 'Medium' : 
                   password?.length >= 8 ? 'Strong' : ''}
                </span>
              </div>
            </div>

            <motion.button 
              type="submit" 
              className={styles.signupButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
              <i className={`${styles.buttonIcon} fas fa-arrow-right`}></i>
            </motion.button>

            <p className={styles.loginPrompt}>
              Already have an account?{" "}
              <Link to="/login" className={styles.loginLink}>
                Log in here
              </Link>
            </p>

            <div className={styles.divider}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerText}>or</span>
              <span className={styles.dividerLine}></span>
            </div>

            <button type="button" className={styles.googleButton}>
              <i className={`${styles.googleIcon} fab fa-google`}></i>
              Sign up with Google
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;