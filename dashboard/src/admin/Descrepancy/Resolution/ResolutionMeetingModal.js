// src/components/KPIBoard/KPIDetails/ResolutionMeetingModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bookMeeting } from "../../../actions/discrepancyActions";
import styles from "./ResolutionMeetingModal.module.css";
import Modal from "../../../UI/modal/Modal";

const ResolutionMeetingModal = ({ isOpen, onClose, flagId, deliverableTitle }) => {
  const dispatch = useDispatch();
  const loading  = useSelector(s => s.discrepancies.loading);
  const [date, setDate]   = useState("");
  const [notes, setNotes] = useState("");

  console.log(flagId,"RMMA");
  

  // default to “now” when it opens
  useEffect(() => {
    if (isOpen) {
      const now    = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      setDate(new Date(now - offset).toISOString().slice(0,16));
      setNotes("");
    }
  }, [isOpen]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!flagId) {
      alert("Cannot book meeting - missing discrepancy reference");
      return;
    }
    if (!date) return alert("Pick a date/time");
    
    const ok = await dispatch(bookMeeting(flagId, { date, notes }));
    if (ok) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content} onClick={e=>e.stopPropagation()}>
        <h2 className={styles.title}>Book Resolution Meeting</h2>
        <p className={styles.subtitle}>
          <strong>Deliverable:</strong> {deliverableTitle}
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="meeting-date">Date &amp; Time</label>
          <input
            id="meeting-date"
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={styles.input}
            required
          />

          <label htmlFor="meeting-notes">
            Notes <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="meeting-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className={styles.textarea}
          />

          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={loading} className={styles.cancel}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submit}>
              {loading ? "Booking…" : "Book Meeting"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ResolutionMeetingModal;
