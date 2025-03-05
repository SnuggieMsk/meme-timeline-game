// src/components/Game/CountrySelector.js
import React from 'react';
import './CountrySelector.css';

function CountrySelector({ countries, selectedCountry, onChange, disabled }) {
  return (
    <div className="country-selector">
      <h3>Which country did it originate from?</h3>
      <select
        value={selectedCountry}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {countries.map(country => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CountrySelector;
