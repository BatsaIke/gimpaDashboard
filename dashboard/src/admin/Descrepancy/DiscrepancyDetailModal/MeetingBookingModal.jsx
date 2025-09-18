import React, { useState, useEffect } from "react"; // Added useEffect for initial state sync
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
  discrepancy // This is the discrepancy object from state.discrepancies.list
}) => {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  // When the modal opens or discrepancy changes, reset or pre-fill state
  useEffect(() => {
    if (isOpen && discrepancy) {
      // If a meeting is already booked (e.g., re-opening to view/edit future meetings)
      if (discrepancy.meeting?.timestamp) {
        setDate(new Date(discrepancy.meeting.timestamp));
        setNotes(discrepancy.meeting.notes || "");
      } else {
        // Default for new booking
        setDate(new Date());
        setNotes("");
      }
    }
  }, [isOpen, discrepancy]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      date: date.toISOString(),
      notes
    });
  };

  // Check if a meeting is already booked on this specific discrepancy object
  const isMeetingAlreadyBookedOnThisDisc = !!discrepancy.meeting;

  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h3>{isMeetingAlreadyBookedOnThisDisc ? "View/Edit Meeting" : "Book Meeting"}</h3>
            <p className={styles.subtitle}>
              For {discrepancy?.kpiId?.name || `KPI ${discrepancy?.kpiId}`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isMeetingAlreadyBookedOnThisDisc && (
            <div className={styles.infoBox}>
              <p>This meeting was previously booked.</p>
            </div>
          )}

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
              {isMeetingAlreadyBookedOnThisDisc ? "Update Booking" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </>,
    document.getElementById("modal-root")
  );
};

export default MeetingBookingModal;