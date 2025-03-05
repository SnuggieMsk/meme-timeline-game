// src/components/Game/YearMonthPicker.js
import React from 'react';
import { getMonths } from '../../data/memeData';
import './YearMonthPicker.css';

function YearMonthPicker({ selectedYear, selectedMonth, onYearChange, onMonthChange, disabled }) {
  const months = getMonths();
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="year-month-picker">
      <h3>When did this meme become popular?</h3>
      
      <div className="date-inputs">
        <div className="month-select">
          <label htmlFor="month">Month:</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            disabled={disabled}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        
        <div className="year-select">
          <label htmlFor="year">Year:</label>
          <input 
            id="year"
            type="number" 
            value={selectedYear} 
            onChange={(e) => onYearChange(parseInt(e.target.value))} 
            min="1995" 
            max={currentYear}
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="time-range">
        <span>1995</span>
        <div className="timeline">
          <div 
            className="timeline-marker" 
            style={{ left: `${((selectedYear - 1995) / (currentYear - 1995)) * 100}%` }}
          ></div>
        </div>
        <span>{currentYear}</span>
      </div>
    </div>
  );
}

export default YearMonthPicker;
