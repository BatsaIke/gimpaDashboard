// src/components/DeliverableCompletion/DeliverableCompletion.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './DeliverableCompletion.module.css';
import DeliverableHeader from './DeliverableHeader';
import DeliverableSummary from './DeliverableSummary';
import DeliverableForm from './DeliverableForm';
import { handleSaveDeliverable } from '../../../../../../utils/saveDeliverable';

/**
 * Main orchestration component – decides whether to show read‑only summary or edit form.
 */
const DeliverableCompletion = ({
  kpiId,
  index,
  deliverable = {},
  onAttachChange = () => {},
  onScoreChange,
  isAssignedUser,
}) => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);

  const hasScore  = deliverable?.assigneeScore?.value !== undefined;
  const hasLocked = deliverable?.hasSavedAssignee === true;
  const hasDone   = hasLocked || hasScore;

  

  return (
    <div className={styles.completionCard}>
      <DeliverableHeader hasDone={hasDone} />

      {hasDone ? (
        <DeliverableSummary deliverable={deliverable} />
      ) : (
        <DeliverableForm
          kpiId={kpiId}
          index={index}
          deliverable={deliverable}
          onAttachChange={onAttachChange}
          onScoreChange={onScoreChange}
          isAssignedUser={isAssignedUser}
          dispatch={dispatch}
          authUser={authUser}
          handleSaveDeliverable={handleSaveDeliverable}
        />
      )}
    </div>
  );
};

export default DeliverableCompletion; 
