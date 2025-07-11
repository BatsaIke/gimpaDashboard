import React from "react";
import Modal from "./Modal.js";
import "./WelcomeModal.module.css";

const WelcomeModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header='Welcome to Highs and Bites'
      footer={
        <button onClick={onClose} className='acceptButton'>
          Accept and Close
        </button>
      }>
      <p >
        We value your privacy and confidentiality. Rest assured, all
        interactions and transactions are handled with the utmost discretion.
      </p>
      <p>
        We operate in Accra. We deliver to anywhere in and around Accra, ready
        to serve you. For more details, please visit our Privacy Policy page.
      </p>
      <p>
        For a faster customer support service, join our Telegram channel to
        leave your comments, questions and recommendations.{" "}
        <a
          href='https://t.me/softmatch'
          target='_blank'
          rel='noopener noreferrer'>
          https://t.me/softmatch
        </a>
      </p>
    </Modal>
  );
};

export default WelcomeModal;
