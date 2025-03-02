import React from "react";
import "../styles/Loading.scss";

const Loading = ({ message = "Loading...", overlay = true }) => {
  return (
    <div className={`loading-container ${overlay ? 'with-overlay' : ''}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-inner"></div>
          <div className="spinner-outer"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default Loading;