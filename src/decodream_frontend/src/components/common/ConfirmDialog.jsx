import React from "react";
import "../styles/ConfirmDialog.scss";

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-dialog">
      <div className="dialog-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-buttons">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;