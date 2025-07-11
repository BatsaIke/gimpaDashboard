import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faTimes, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './DeliverableForm.module.css';
import { fetchUserKpis } from '../../../../../../actions/kpiActions';

const DeliverableForm = ({
  kpiId,
  index,
  deliverable,
 onAttachChange = () => {},  
  isAssignedUser,
  dispatch,
  authUser,
  handleSaveDeliverable
}) => {
  const [bufferScore, setBufferScore] = useState(deliverable?.assigneeScore?.value ?? '');
  const [bufferNotes, setBufferNotes] = useState(deliverable?.notes ?? '');
  const [bufferFiles, setBufferFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const numericScore = Number(bufferScore);
  const scoreIsValid = !isNaN(numericScore) && numericScore >= 0 && numericScore <= 100;
  const isSaveEnabled = scoreIsValid && bufferNotes.trim() && isAssignedUser;

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setBufferFiles(prev => [...prev, ...files]);
  };

  const dragOver = e => { e.preventDefault(); setIsDragOver(true); };
  const dragLeave = () => setIsDragOver(false);
  const drop = e => { e.preventDefault(); setIsDragOver(false); const files = Array.from(e.dataTransfer.files || []); if(files.length) setBufferFiles(prev=>[...prev,...files]); };
  const removeFile = idx => setBufferFiles(prev => prev.filter((_,i)=>i!==idx));

const handleSave = async () => {
  if (!isSaveEnabled || isSaving) return;
  setIsSaving(true);
  setSaveError(null);

  try {
    await handleSaveDeliverable({
      dispatch,
      kpiId,
      index,
      userId: authUser?._id,
     updates: {
    assigneeScore: {
      value : numericScore,
      notes : bufferNotes,          // ⬅️ now INSIDE the score snapshot
      // enteredBy & timestamp are injected by handleSaveDeliverable
    },
    evidence         : bufferFiles.length ? bufferFiles : undefined,
    hasSavedAssignee : true,
  },
    });

    // Upload evidence files if any
    bufferFiles.forEach(file => onAttachChange(index, 'newEvidence', file));
    setBufferFiles([]);

    // ✅ Dispatch fetchUserKpis to refresh just the assignee’s data
    await dispatch(fetchUserKpis(authUser?._id));
  } catch (err) {
    setSaveError(err.message ?? 'Failed to save, please try again.');
  } finally {
    setIsSaving(false);
  }
};



  return (
    <div className={styles.formBox}>
      {/* Score */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Your Score (0-100) <span className={styles.req}>*</span></label>
        <input type="number" min="0" max="100" value={bufferScore} onChange={e=>setBufferScore(e.target.value)} className={styles.scoreInput} aria-invalid={!scoreIsValid} />
      </div>

      {/* Notes */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Completion Notes <span className={styles.req}>*</span></label>
        <textarea rows={4} value={bufferNotes} onChange={e=>setBufferNotes(e.target.value)} className={styles.notesInput} />
      </div>

      {/* Upload */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Supporting Evidence</label>
        <div className={`${styles.uploadZone} ${isDragOver?styles.dragOver:''}`} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={drop}>
          <label className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faPaperclip} className={styles.icon} />
            <span>Drag & drop files or click to browse</span>
            <input type="file" multiple onChange={handleFilePick} className={styles.fileInput} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
          </label>
        </div>
        {bufferFiles.length>0 && (
          <ul className={styles.fileList}>
            {bufferFiles.map((file,i)=>(
              <li key={i} className={styles.fileItem}>
                <span><FontAwesomeIcon icon={faPaperclip}/> {file.name}</span>
                <button type="button" onClick={()=>removeFile(i)} className={styles.removeBtn} aria-label={`Remove ${file.name}`}><FontAwesomeIcon icon={faTimes}/></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button type="button" onClick={handleSave} disabled={!isSaveEnabled || isSaving} className={styles.saveBtn}>
          {isSaving ? 'Saving…' : (<><FontAwesomeIcon icon={faCheckCircle}/> Submit Completion</>)}
        </button>
        {saveError && (<p className={styles.error}><FontAwesomeIcon icon={faExclamationCircle}/> {saveError}</p>)}
      </div>
    </div>
  );
};

export default DeliverableForm;
