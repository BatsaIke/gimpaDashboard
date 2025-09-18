// components/NetworkModal.js
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./NetworkModal.module.css";
import useNetworkStatus from "../../admin/hooks/useNetworkStatus";

const NetworkModal = () => {
  const { online, restoring, explicitOffline } = useNetworkStatus();
  const [showModal, setShowModal] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (explicitOffline) {
      setShowModal(true);
      setWasOffline(true);
    } else if (wasOffline && online) {
      setShowModal(true);
      const timer = setTimeout(() => {
        setShowModal(false);
        setWasOffline(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [online, explicitOffline, wasOffline]);

  if (!showModal) return null;

  return ReactDOM.createPortal(
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {!explicitOffline && restoring ? (
          <>
            <h3 className={styles.title}>Connection Restored 🎉</h3>
            <p className={styles.message}>You're back online!</p>
          </>
        ) : (
          <>
            <h3 className={styles.title}>No Network Connection</h3>
            <p className={styles.message}>
              Please check your internet connection.
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default NetworkModal;