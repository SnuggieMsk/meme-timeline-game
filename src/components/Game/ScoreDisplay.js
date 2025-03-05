// src/components/Game/ScoreDisplay.js
import React from 'react';
import './ScoreDisplay.css';

function ScoreDisplay({ score }) {
  return (
    <div className="score-display">
      <h3>Score</h3>
      <div className="score-value">{score}</div>
    </div>
  );
}

export default ScoreDisplay;
