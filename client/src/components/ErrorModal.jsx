import React from 'react';
import Modal from 'react-modal';

const ErrorModal = ({ isOpen, errorMessage, closeModal }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Error Modal"
    >
      <div className="modal-header">
        <h2>Error</h2>
        <button onClick={closeModal} className="close">
          &times;
        </button>
      </div>
      <div className="modal-body">
        <p>{errorMessage}</p>
      </div>
    </Modal>
  );
};

export default ErrorModal;
