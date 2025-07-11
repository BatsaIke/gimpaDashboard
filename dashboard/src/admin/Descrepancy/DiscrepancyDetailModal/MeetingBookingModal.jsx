import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./MeetingBookingModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, 
  faCalendarAlt,
  faPaperclip
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MeetingBookingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  discrepancy 
}) => {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      date: date.toISOString(),
      notes
    });
  };

  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h3>Book Meeting</h3>
            <p className={styles.subtitle}>
              For {discrepancy?.kpiId?.name || `KPI ${discrepancy?.kpiId}`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faCalendarAlt} />
              Meeting Date & Time
            </label>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className={styles.datePicker}
              minDate={new Date()}
              wrapperClassName={styles.datePickerWrapper}
              popperClassName={styles.datePickerPopper}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faPaperclip} />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              rows={4}
              placeholder="Add any additional notes about this meeting..."
            />
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </>,
    document.getElementById("modal-root")
  );
};

export default MeetingBookingModal;