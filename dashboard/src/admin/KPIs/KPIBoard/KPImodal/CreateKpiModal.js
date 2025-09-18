// src/components/KPIBoard/KPIModal/CreateKpiModal.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  FaTimes, FaSave, FaUserTie, FaUsers, FaTasks } from "react-icons/fa";

// Redux actions
import { fetchDepartments } from "../../../../actions/departmentsActions";
import { createKpi } from "../../../../actions/kpiActions";
import { fetchEmployees } from "../../../../actions/authAction";

import KpiMainFields from "../KpiMainFields";
import UserAndRoleSelection from "../UserAndRoleSelection";

import styles from "./CreateKpiModal.module.css";
import { fetchKpiHeaders } from "../../../../actions/kpiHeaderActions";
import DeliverablesSection from "../DeliverableCreation/DeliverablesSection";

const CreateKpiModal = ({ isOpen, onClose, selectedHeaderId }) => {
  const dispatch = useDispatch();

  // Departments & Employees from Redux
  const { items: departments = [] } = useSelector((state) => state.departments);
  const users = useSelector((state) => state.auth.users || []);

  // Form state for new KPI
  const [newKpi, setNewKpi] = useState({
    name: "",
    description: "",
    departments: [],
    assignedUsers: [],
    assignedRoles: [],
    deliverables: [],
    header: selectedHeaderId,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update header when selectedHeaderId changes
  useEffect(() => {
    setNewKpi((prev) => ({
      ...prev,
      header: selectedHeaderId,
    }));
  }, [selectedHeaderId]);

  // Fetch supporting data when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDepartments());
      dispatch(fetchEmployees());
    }
  }, [isOpen, dispatch]);

const validateForm = () => {
  const errors = {};
  
  // Required fields
  if (!newKpi.name.trim()) {
    errors.name = "KPI name is required";
  }
  
  if (!newKpi.description.trim()) {
    errors.description = "Description is required";
  }
  
  // Assignment validation - only need one of these three
  if (
    newKpi.departments.length === 0 && 
    newKpi.assignedUsers.length === 0 && 
    newKpi.assignedRoles.length === 0
  ) {
    errors.assignment = "You must assign using at least one method (department, user, or role)";
  }
  
  // Header validation
  if (!newKpi.header) {
    errors.header = "KPI header is required";
  }
  
  // Deliverables validation
  if (newKpi.deliverables.length === 0) {
    errors.deliverables = "At least one deliverable is required";
  } else {
    newKpi.deliverables.forEach((deliverable, index) => {
  if (!deliverable.title.trim()) {
    errors[`deliverable-title-${index}`] = "Title is required";
  }

  if (deliverable.isRecurring) {
    if (!deliverable.recurrencePattern?.trim()) {
      errors[`deliverable-recurrencePattern-${index}`] = "Recurrence pattern is required";
    }
  } else {
    if (!deliverable.timeline) {
      errors[`deliverable-timeline-${index}`] = "Timeline is required";
    }
  }
})

  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  const formData = new FormData();
  formData.append("name", newKpi.name);
  formData.append("description", newKpi.description);
  formData.append("departments", JSON.stringify(newKpi.departments));
  formData.append("assignedUsers", JSON.stringify(newKpi.assignedUsers));
  formData.append("assignedRoles", JSON.stringify(newKpi.assignedRoles));
  formData.append("header", newKpi.header);

  const deliverablesForJson = newKpi.deliverables.map((d) => {
    const { evidenceFile, ...rest } = d;
    return rest;
  });
  formData.append("deliverables", JSON.stringify(deliverablesForJson));

  newKpi.deliverables.forEach((deliverable, index) => {
    if (deliverable.evidenceFile) {
      formData.append(`deliverableFile_${index}`, deliverable.evidenceFile);
    }
  });

  try {
    const result = await dispatch(createKpi(formData));

    if (result?.success) {
      // ✅ AFTER SUCCESS - refresh the board!
      dispatch(fetchKpiHeaders());

      setNewKpi({
        name: "",
        description: "",
        departments: [],
        assignedUsers: [],
        assignedRoles: [],
        deliverables: [],
        header: selectedHeaderId,
      });
      onClose();
    } else {
      console.log("KPI creation failed - modal remains open");
    }
  } catch (error) {
    console.error("Error creating KPI:", error);
  } finally {
    setIsSubmitting(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>Create New KPI</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formSections}>
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <FaUserTie className={styles.sectionIcon} />
                <h3>Basic Information</h3>
              </div>
              <KpiMainFields 
                newKpi={newKpi} 
                setNewKpi={setNewKpi} 
                departments={departments}
                errors={formErrors}
              />
            </section>

            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <FaUsers className={styles.sectionIcon} />
                <h3>Assignment</h3>
                {formErrors.assignment && (
                  <span className={styles.sectionError}>{formErrors.assignment}</span>
                )}
              </div>
              <UserAndRoleSelection
                newKpi={newKpi}
                setNewKpi={setNewKpi}
                employees={users}
              />
            </section>

            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <FaTasks className={styles.sectionIcon} />
                <h3>Deliverables</h3>
                {formErrors.deliverables && (
                  <span className={styles.sectionError}>{formErrors.deliverables}</span>
                )}
              </div>
              <DeliverablesSection
                newKpi={newKpi}
                setNewKpi={setNewKpi}
                errors={formErrors}
              />
            </section>
          </div>

          <div className={styles.modalFooter}>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  <FaSave /> Create KPI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKpiModal;