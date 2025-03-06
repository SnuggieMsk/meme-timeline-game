// src/components/Game/CountrySelector.js
import React, { useState } from 'react';
import './CountrySelector.css';

function CountrySelector({ countries, selectedCountry, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Top countries that are most common for memes
  const topCountries = ['United States', 'United Kingdom', 'Japan', 'Global/Internet'];
  
  // Filter out top countries from the rest
  const otherCountries = countries.filter(c => !topCountries.includes(c)).sort();
  
  const handleSelect = (country) => {
    onChange(country);
    setIsOpen(false);
  };
  
  return (
    <div className="country-selector">
      <h3>Which country did it originate from?</h3>
      
      <div className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}>
        <div 
          className="select-selected"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span>{selectedCountry}</span>
          <div className="select-arrow"></div>
        </div>
        
        {isOpen && !disabled && (
          <div className="select-items">
            {/* Top/common countries section */}
            <div className="country-group">
              <div className="group-label">Common Origins</div>
              {topCountries.map(country => (
                <div 
                  key={country}
                  className={`select-item ${selectedCountry === country ? 'selected' : ''}`}
                  onClick={() => handleSelect(country)}
                >
                  {country}
                </div>
              ))}
            </div>
            
            {/* Other countries section */}
            <div className="country-group">
              <div className="group-label">Other Countries</div>
              {otherCountries.map(country => (
                <div 
                  key={country}
                  className={`select-item ${selectedCountry === country ? 'selected' : ''}`}
                  onClick={() => handleSelect(country)}
                >
                  {country}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Common countries quick selection */}
      <div className="quick-countries">
        {topCountries.map(country => (
          <button
            key={country}
            className={`quick-country-btn ${selectedCountry === country ? 'active' : ''}`}
            onClick={() => !disabled && onChange(country)}
            disabled={disabled}
          >
            {country}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CountrySelector;
