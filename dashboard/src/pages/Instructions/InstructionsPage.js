import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMinus,
  faChartLine,
  faBullseye as faTarget,                 
  faListCheck as faTasks,                 
  faArrowRightArrowLeft as faExchangeAlt, 
  faFlag,
  faUsers,
  faGear as faCog                         
} from '@fortawesome/free-solid-svg-icons';
import styles from './InstructionsPage.module.css';

const InstructionsPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  const instructions = [
    {
      id: 'intro',
      title: 'About KPI Management System',
      icon: faChartLine,
      content: (
        <div>
          <p>Our KPI Management System is designed to help organizations track, manage, and evaluate Key Performance Indicators effectively.</p>
          <h4>Key Features:</h4>
          <ul>
            <li>Create and manage KPIs with custom deliverables</li>
            <li>Assign KPIs to team members</li>
            <li>Track progress and status changes</li>
            <li>Evaluate performance with scoring system</li>
            <li>Resolve discrepancies through integrated communication</li>
          </ul>
        </div>
      )
    },
    {
      id: 'create-kpi',
      title: 'How to Create a KPI',
      icon: faTarget,
      content: (
        <div>
          <h4>Step-by-Step Guide:</h4>
          <ol>
            <li>Navigate to the KPI section from the main dashboard</li>
            <li>Click on the "Create New KPI" button</li>
            <li>Fill in the KPI details:
              <ul>
                <li><strong>Name:</strong> Descriptive title for the KPI</li>
                <li><strong>Description:</strong> Detailed explanation of what the KPI measures</li>
                <li><strong>Target User:</strong> Select the team member responsible</li>
                <li><strong>Timeline:</strong> Set start and end dates</li>
                <li><strong>Priority:</strong> Set importance level (High, Medium, Low)</li>
              </ul>
            </li>
            <li>Click "Save" to create the KPI</li>
          </ol>
        </div>
      )
    },
    {
      id: 'add-deliverables',
      title: 'How to Add Deliverables',
      icon: faTasks,
      content: (
        <div>
          <h4>Adding Deliverables to a KPI:</h4>
          <ol>
            <li>Open the KPI you want to add deliverables to</li>
            <li>Scroll to the "Deliverables" section</li>
            <li>Click "Add Deliverable"</li>
            <li>Fill in deliverable details:
              <ul>
                <li><strong>Title:</strong> Name of the deliverable</li>
                <li><strong>Description:</strong> What needs to be accomplished</li>
                <li><strong>Action:</strong> Specific action required</li>
                <li><strong>Indicator:</strong> How success will be measured</li>
                <li><strong>Evidence:</strong> What proof of completion is needed</li>
              </ul>
            </li>
            <li>Set the priority and timeline</li>
            <li>Save the deliverable</li>
          </ol>
          <p><strong>Tip:</strong> You can add multiple deliverables to each KPI to break down complex goals into manageable tasks.</p>
        </div>
      )
    },
    {
      id: 'status-management',
      title: 'How to Manage Statuses',
      icon: faExchangeAlt,
      content: (
        <div>
          <h4>Understanding Status Types:</h4>
          <ul>
            <li><strong>Pending:</strong> Not yet started</li>
            <li><strong>In Progress:</strong> Currently being worked on</li>
            <li><strong>Completed:</strong> Finished by the assignee</li>
            <li><strong>Approved:</strong> Verified and accepted by manager</li>
          </ul>
          
          <h4>Changing Statuses:</h4>
          <ol>
            <li>Navigate to the KPI or deliverable you want to update</li>
            <li>Locate the status dropdown menu</li>
            <li>Select the appropriate status</li>
            <li>Add any required comments or evidence</li>
            <li>Save your changes</li>
          </ol>
          
          <p><strong>Note:</strong> Some status changes may require approval or trigger notifications to other team members.</p>
        </div>
      )
    },
    {
      id: 'discrepancies',
      title: 'How to Handle Discrepancies',
      icon: faFlag,
      content: (
        <div>
          <h4>What are Discrepancies?</h4>
          <p>Discrepancies occur when there's a significant difference between the assignee's self-assessment and the manager's evaluation score.</p>
          
          <h4>Resolving Discrepancies:</h4>
          <ol>
            <li>When a discrepancy is detected, the system will flag it automatically</li>
            <li>Review the scores and comments from both parties</li>
            <li>Use the "Book Resolution Meeting" button to schedule a discussion</li>
            <li>During the meeting, discuss the differences in assessment</li>
            <li>Reach a consensus and update the scores if needed</li>
            <li>Add resolution notes for future reference</li>
          </ol>
        </div>
      )
    },
    {
      id: 'user-management',
      title: 'How to Manage Users',
      icon: faUsers,
      content: (
        <div>
          <h4>User Management Features:</h4>
          <ul>
            <li>Add new team members to the system</li>
            <li>Assign roles and permissions</li>
            <li>Assign KPIs to specific users</li>
            <li>Track individual performance</li>
            <li>Generate user-specific reports</li>
          </ul>
          
          <h4>Adding a New User:</h4>
          <ol>
            <li>Go to the "Users" section from the admin dashboard</li>
            <li>Click "Add New User"</li>
            <li>Fill in the user's details (name, email, role)</li>
            <li>Set appropriate permissions</li>
            <li>Send invitation email</li>
          </ol>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'How to Generate Reports',
      icon: faCog,
      content: (
        <div>
          <h4>Available Report Types:</h4>
          <ul>
            <li><strong>Performance Reports:</strong> Individual or team performance metrics</li>
            <li><strong>Completion Reports:</strong> Status of KPI and deliverable completion</li>
            <li><strong>Discrepancy Reports:</strong> Analysis of scoring differences</li>
            <li><strong>Timeline Reports:</strong> Progress against deadlines</li>
          </ul>
          
          <h4>Generating a Report:</h4>
          <ol>
            <li>Navigate to the "Reports" section</li>
            <li>Select the report type you need</li>
            <li>Choose date range and filters</li>
            <li>Select specific users or departments if needed</li>
            <li>Click "Generate Report"</li>
            <li>Export or print the report as needed</li>
          </ol>
        </div>
      )
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>KPI Management Guide</h1>
          <p className={styles.pageSubtitle}>
            Learn how to effectively use our KPI management system to track performance, 
            manage deliverables, and evaluate team members.
          </p>
        </div>

        <div className={styles.instructionsContainer}>
          {instructions.map((item) => (
            <div 
              key={item.id} 
              className={`${styles.instructionCard} ${activeSection === item.id ? styles.active : ''}`}
            >
              <div 
                className={styles.cardHeader} 
                onClick={() => toggleSection(item.id)}
              >
                <div className={styles.headerContent}>
                  <FontAwesomeIcon icon={item.icon} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
                <FontAwesomeIcon 
                  icon={activeSection === item.id ? faMinus : faPlus} 
                  className={styles.expandIcon} 
                />
              </div>
              
              {activeSection === item.id && (
                <div className={styles.cardContent}>
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.helpSection}>
          <h2>Need Additional Help?</h2>
          <p>If you have questions not covered in this guide, please contact our support team:</p>
          <div className={styles.helpContacts}>
            <p>Email: support@kpisystem.com</p>
            <p>Phone: +233 543 869 957</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;