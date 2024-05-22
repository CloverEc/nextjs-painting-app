import React from 'react';
import './LoadingSpinner.css'; // Import the CSS file for the spinner

const LoadingSpinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
    </div>
  );
};

export default LoadingSpinner;

