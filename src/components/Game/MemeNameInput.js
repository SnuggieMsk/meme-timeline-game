// src/components/Game/MemeNameInput.js
import React, { useState } from 'react';
import './MemeNameInput.css';

function MemeNameInput({ memeName, onChange, disabled }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="meme-name-input">
      <h3>What is this meme called?</h3>
      
      <div className={`input-container ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
        <input
          type="text"
          value={memeName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter meme name (e.g., 'Distracted Boyfriend', 'Doge')"
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <div className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-15c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 9c-1.11 0-2-.89-2-2s.89-2 2-2 2 .89 2 2-.89 2-2 2zm0-6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
          </svg>
        </div>
      </div>
      
      {memeName.trim() === '' && !disabled && (
        <p className="input-help">
          Be specific! Try to use the exact name the meme is commonly known by.
        </p>
      )}
    </div>
  );
}

export default MemeNameInput;
