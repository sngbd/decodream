import React from "react";
import "../styles/Loading.scss";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-indicator">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};


export default Loading;