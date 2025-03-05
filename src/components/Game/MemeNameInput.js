// src/components/Game/MemeNameInput.js
import React from 'react';
import './MemeNameInput.css';

function MemeNameInput({ memeName, onChange, disabled }) {
  return (
    <div className="meme-name-input">
      <h3>What is this meme called?</h3>
      <input
        type="text"
        value={memeName}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter meme name (e.g., 'Distracted Boyfriend', 'Doge')"
        disabled={disabled}
      />
    </div>
  );
}

export default MemeNameInput;
