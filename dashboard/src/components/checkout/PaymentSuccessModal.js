// PaymentSuccessModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaymPamentSuccessModal.module.css'; 
import Modal from '../../UI/modal/Modal';

const PaymentSuccessModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const continueShopping = () => {
    onClose(); // Close the modal
    navigate('/'); // Redirect to home page
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h2>Payment Successful!</h2>
        <p>Your order has been placed successfully.</p>
        <button onClick={continueShopping}>Continue Shopping</button>
      </div>
    </Modal>
  );
};

export default PaymentSuccessModal;
