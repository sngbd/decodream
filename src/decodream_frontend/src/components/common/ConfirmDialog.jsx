import React from "react";
import "../styles/ConfirmDialog.scss";

const ConfirmDialog = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "default"
}) => {
  return (
    <div className="confirm-dialog-backdrop">
      <div className={`confirm-dialog ${type}`}>
        <div className="dialog-content">
          <h3>
            {type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
            {type === 'danger' && <i className="fas fa-exclamation-circle"></i>}
            {type === 'default' && <i className="fas fa-question-circle"></i>}
            {title}
          </h3>
          
          <div className="message-content">
            {message}
          </div>
          
          <div className="dialog-buttons">
            <button className="cancel-button dream-button" onClick={onCancel}>
              <i className="fas fa-times"></i> {cancelText}
            </button>
            <button 
              className={`confirm-button dream-button ${type === 'danger' ? 'delete-button' : ''}`} 
              onClick={onConfirm}
            >
              {type === 'danger' && <i className="fas fa-trash"></i>}
              {type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
              {type === 'default' && <i className="fas fa-check"></i>}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;