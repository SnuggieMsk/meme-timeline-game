// src/components/Game/YearMonthPicker.js
import React, { useState, useEffect, useRef } from 'react';
import { getMonths } from '../../data/memeData';
import './YearMonthPicker.css';

function YearMonthPicker({ selectedYear, selectedMonth, onYearChange, onMonthChange, disabled }) {
  const months = getMonths();
  const currentYear = new Date().getFullYear();
  const minYear = 1995;
  const yearsRange = currentYear - minYear;
  
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Initialize and update slider width
  useEffect(() => {
    const updateSliderWidth = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };
    
    updateSliderWidth();
    window.addEventListener('resize', updateSliderWidth);
    
    return () => {
      window.removeEventListener('resize', updateSliderWidth);
    };
  }, []);

  // Handle mouse/touch events for slider
  const handleSliderClick = (e) => {
    if (disabled) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    const newYear = Math.round(minYear + (percentage * yearsRange));
    onYearChange(newYear);
  };

  // Generate year markers for the timeline
  const generateYearMarkers = () => {
    const markers = [];
    const step = Math.floor(yearsRange / 6); // Show about 6 markers
    
    for (let i = 0; i <= yearsRange; i += step) {
      const year = minYear + i;
      const position = (i / yearsRange) * 100;
      
      markers.push(
        <div 
          key={year} 
          className="year-marker"
          style={{ left: `${position}%` }}
        >
          <div className="marker-line"></div>
          <span className="marker-label">{year}</span>
        </div>
      );
    }
    
    // Always add the current year as last marker if not already included
    if ((currentYear - minYear) % step !== 0) {
      markers.push(
        <div 
          key={currentYear} 
          className="year-marker"
          style={{ left: '100%' }}
        >
          <div className="marker-line"></div>
          <span className="marker-label">{currentYear}</span>
        </div>
      );
    }
    
    return markers;
  };
  
  return (
    <div className="year-month-picker">
      <h3>When did this meme become popular?</h3>
      
      {/* Month selector */}
      <div className="month-selector">
        <label>Month:</label>
        <div className="month-buttons">
          {months.map(month => (
            <button
              key={month.value}
              className={`month-button ${selectedMonth === month.value ? 'active' : ''}`}
              onClick={() => !disabled && onMonthChange(month.value)}
              disabled={disabled}
              title={month.label}
            >
              {month.label.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Year slider */}
      <div className="year-slider-container">
        <label>Year: <span className="year-value">{selectedYear}</span></label>
        <div
          className={`timeline-slider ${disabled ? 'disabled' : ''}`}
          ref={sliderRef}
          onClick={handleSliderClick}
        >
          <div className="timeline-track"></div>
          {generateYearMarkers()}
          <div 
            className="timeline-handle"
            style={{ 
              left: `${((selectedYear - minYear) / yearsRange) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default YearMonthPicker;
