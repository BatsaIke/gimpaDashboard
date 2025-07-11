import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./Modal.module.css";

/**
 * @param {boolean} isOpen - Controls whether the modal is visible
 * @param {function} onClose - Called when user clicks outside or presses the close button
 * @param {ReactNode} children - The main content of the modal
 * @param {string} header - Title text to display in the header (optional)
 * @param {string} className - Custom class(es) to style or override default .modal
 * @param {React.CSSProperties} customStyle - Inline styles for dynamic styling
 * @param {ReactNode} footer - Optional footer content/buttons
 */
const Modal = ({ isOpen, onClose, children, header, className, customStyle, footer }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Clickable overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Modal container */}
      <div
        className={`${styles.modal} ${className}`}
        style={customStyle} // Apply dynamic styles
      >
        {/* Header with title and close button */}
        {header && (
          <div className={styles.header}>
            <h3 className={styles.title}>{header}</h3>
            <button className={styles.closeButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
              <span className={styles.closeText}>Close</span>
            </button>
          </div>
        )}

        {/* Main content */}
        <div className={styles.content}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>,
    document.getElementById("modal-root")
  );
};

export default Modal;
