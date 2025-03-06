#!/bin/bash
# Meme Timeline Game - UI Upgrade Script
# This script updates all UI components with improved versions

# Set text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Meme Timeline Game - UI Upgrade     ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if we're in the project directory
if [ ! -f "package.json" ] || ! grep -q "meme-timeline-game" "package.json"; then
  echo -e "${RED}Error: This script must be run from the meme-timeline-game project root directory${NC}"
  echo -e "${YELLOW}Please navigate to your project directory and try again${NC}"
  exit 1
fi

echo -e "\n${GREEN}Starting UI upgrade...${NC}"

# Create directories if they don't exist
echo -e "\n${YELLOW}Checking and creating directories...${NC}"
mkdir -p src/components/Game
mkdir -p src/components/Admin
mkdir -p src/components/Shared
mkdir -p src/data

# ----------------------------
# Update Game Components
# ----------------------------
echo -e "\n${YELLOW}Updating Game components...${NC}"

# YearMonthPicker Component
echo -e "  ${BLUE}➤ Creating YearMonthPicker.js${NC}"
cat > src/components/Game/YearMonthPicker.js << 'EOL'
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
EOL

echo -e "  ${BLUE}➤ Creating YearMonthPicker.css${NC}"
cat > src/components/Game/YearMonthPicker.css << 'EOL'
/* src/components/Game/YearMonthPicker.css */
.year-month-picker {
  width: 100%;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.year-month-picker h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--secondary-color);
  font-size: 1.2rem;
  text-align: center;
}

/* Month buttons */
.month-selector {
  margin-bottom: 25px;
}

.month-selector label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--secondary-color);
}

.month-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

@media (max-width: 576px) {
  .month-buttons {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 400px) {
  .month-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

.month-button {
  padding: 8px 0;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-button:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.month-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  font-weight: bold;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(255, 69, 0, 0.3);
}

.month-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Year slider */
.year-slider-container {
  margin-top: 10px;
}

.year-slider-container label {
  display: block;
  margin-bottom: 15px;
  font-weight: 600;
  color: var(--secondary-color);
}

.year-value {
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: bold;
}

.timeline-slider {
  position: relative;
  height: 60px;
  width: 100%;
  margin: 0 auto;
  padding-top: 25px;
  padding-bottom: 25px;
  cursor: pointer;
}

.timeline-slider.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.timeline-track {
  position: absolute;
  top: 25px;
  left: 0;
  right: 0;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
}

.timeline-handle {
  position: absolute;
  top: 19px;
  width: 18px;
  height: 18px;
  background-color: var(--primary-color);
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: grab;
  z-index: 2;
  transition: transform 0.1s ease;
}

.timeline-handle:hover {
  transform: translateX(-50%) scale(1.2);
}

.timeline-slider.disabled .timeline-handle {
  background-color: #999;
  cursor: not-allowed;
}

/* Year markers */
.year-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
}

.marker-line {
  position: absolute;
  top: 25px;
  height: 6px;
  width: 2px;
  background-color: #999;
}

.marker-label {
  position: absolute;
  top: 35px;
  left: 0;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #666;
}
EOL

# MemeNameInput Component
echo -e "  ${BLUE}➤ Creating MemeNameInput.js${NC}"
cat > src/components/Game/MemeNameInput.js << 'EOL'
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
EOL

echo -e "  ${BLUE}➤ Creating MemeNameInput.css${NC}"
cat > src/components/Game/MemeNameInput.css << 'EOL'
/* src/components/Game/MemeNameInput.css */
.meme-name-input {
  width: 100%;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.meme-name-input h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--secondary-color);
  font-size: 1.2rem;
  text-align: center;
}

.input-container {
  position: relative;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.input-container.focused {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.2);
}

.input-container.disabled {
  background-color: #f5f5f5;
  border-color: #ddd;
}

.meme-name-input input {
  width: 100%;
  padding: 14px 45px 14px 15px;
  border: none;
  font-size: 16px;
  background: transparent;
}

.meme-name-input input:focus {
  outline: none;
}

.meme-name-input input:disabled {
  cursor: not-allowed;
  color: #777;
}

.input-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #aaa;
}

.input-container.focused .input-icon {
  color: var(--primary-color);
}

.input-container.disabled .input-icon {
  color: #bbb;
}

.input-help {
  margin: 5px 0 0;
  font-size: 0.85rem;
  color: #777;
  font-style: italic;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
EOL

# CountrySelector Component
echo -e "  ${BLUE}➤ Creating CountrySelector.js${NC}"
cat > src/components/Game/CountrySelector.js << 'EOL'
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
EOL

echo -e "  ${BLUE}➤ Creating CountrySelector.css${NC}"
cat > src/components/Game/CountrySelector.css << 'EOL'
/* src/components/Game/CountrySelector.css */
.country-selector {
  width: 100%;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.country-selector h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--secondary-color);
  font-size: 1.2rem;
  text-align: center;
}

/* Custom dropdown styling */
.custom-select {
  position: relative;
  width: 100%;
  margin-bottom: 15px;
}

.select-selected {
  padding: 14px 15px;
  background-color: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.custom-select:not(.disabled) .select-selected:hover {
  background-color: #f0f0f0;
}

.custom-select.open .select-selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.2);
  border-radius: 8px 8px 0 0;
}

.custom-select.disabled .select-selected {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #777;
  border-color: #ddd;
}

.select-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #888;
  transition: transform 0.3s ease;
}

.custom-select.open .select-arrow {
  transform: rotate(180deg);
}

.select-items {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: white;
  border: 2px solid var(--primary-color);
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.country-group {
  padding: 5px 0;
}

.group-label {
  padding: 8px 15px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: #f5f5f5;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.select-item:hover {
  background-color: #f5f5f5;
}

.select-item.selected {
  background-color: rgba(255, 69, 0, 0.1);
  color: var(--primary-color);
  font-weight: 600;
}

/* Quick selection buttons */
.quick-countries {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.quick-country-btn {
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: fit-content;
  max-width: calc(50% - 4px);
  text-align: center;
}

.quick-country-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.quick-country-btn.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  border-color: var(--primary-color);
}

.quick-country-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
EOL

# GameScreen Component
echo -e "  ${BLUE}➤ Creating GameScreen.js${NC}"
cat > src/components/Game/GameScreen.js << 'EOL'
// src/components/Game/GameScreen.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  getMonths, 
  getMonthName,
  calculateDateScore,
  calculateCountryScore,
  calculateMemeNameScore,
  countries
} from '../../data/memeData';

import VideoPlayer from './VideoPlayer';
import YearMonthPicker from './YearMonthPicker';
import MemeNameInput from './MemeNameInput';
import CountrySelector from './CountrySelector';
import ScoreDisplay from './ScoreDisplay';
import './GameScreen.css';

function GameScreen() {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2015);
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [memeName, setMemeName] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isGuessing, setIsGuessing] = useState(true);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    // Fetch videos from Firestore
    const fetchVideos = async () => {
      try {
        setError('');
        const videosCollection = collection(db, 'memeVideos');
        const videosQuery = query(videosCollection, orderBy('createdAt', 'desc'), limit(50));
        const videoSnapshot = await getDocs(videosQuery);
        const videosList = videoSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setVideos(videosList);
        
        if (videosList.length > 0) {
          // Select a random video
          const randomIndex = Math.floor(Math.random() * videosList.length);
          setCurrentVideo(videosList[randomIndex]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load meme videos. Please try refreshing the page.');
        setLoading(false);
      }
    };

    fetchVideos();
    
    // Load score from localStorage
    const savedScore = localStorage.getItem('memeGameScore');
    if (savedScore) {
      setScore(parseInt(savedScore, 10));
    }
  }, []);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  const handleMemeNameChange = (name) => {
    setMemeName(name);
  };

  const handleSubmitGuess = () => {
    if (!currentVideo) return;
    
    // Get the difficulty from the video data, default to 'medium' if not set
    const difficulty = currentVideo.difficulty || 'medium';
    const difficultyMultiplier = 
      difficulty === 'easy' ? 1.0 : 
      difficulty === 'hard' ? 2.0 : 1.5; // medium is default at 1.5
    
    // Score for the date (month and year)
    const dateResult = calculateDateScore(
      selectedYear, 
      selectedMonth, 
      currentVideo.year, 
      currentVideo.month
    );
    
    // Score for the country
    const countryResult = calculateCountryScore(selectedCountry, currentVideo.country);
    
    // Score for the meme name
    const nameResult = calculateMemeNameScore(memeName, currentVideo.memeName);
    
    // Calculate total score with difficulty multiplier
    const totalScore = Math.round((dateResult.score + countryResult.score + nameResult.score) * difficultyMultiplier);
    
    // Create feedback
    const dateFeedback = `${dateResult.feedback}`;
    const feedbackText = `
      ${dateFeedback}
      ${countryResult.feedback}
      ${nameResult.feedback}
      
      Total points: ${totalScore} (${difficultyMultiplier}x multiplier for ${difficulty} difficulty)
    `;
    
    // Update score and feedback
    const newScore = score + totalScore;
    setScore(newScore);
    localStorage.setItem('memeGameScore', newScore.toString());
    
    setFeedback(feedbackText);
    setIsGuessing(false);
    
    // Show correct answer details after submitting
    setShowCorrectAnswer(true);
  };

  const handleNextVideo = () => {
    if (videos.length <= 1) {
      return;
    }
    
    // Select a new random video that's different from current
    const filteredVideos = videos.filter(v => v.id !== currentVideo.id);
    const randomIndex = Math.floor(Math.random() * filteredVideos.length);
    setCurrentVideo(filteredVideos[randomIndex]);
    
    // Reset state for next round
    setFeedback('');
    setIsGuessing(true);
    setShowCorrectAnswer(false);
    setSelectedYear(2015);
    setSelectedMonth(6);
    setSelectedCountry('United States');
    setMemeName('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading meme videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="no-videos-container">
        <h2>No Meme Videos Available</h2>
        <p>There are no meme videos available to play. Please check back later or contact the administrator.</p>
      </div>
    );
  }
  
  const difficultyLabels = {
    easy: "Easy 😊",
    medium: "Medium 😐",
    hard: "Hard 😨"
  };

  return (
    <div className="game-container">
      <h1>Meme Timeline Challenge</h1>
      <p className="game-subtitle">Guess when and where the meme originated!</p>
      
      {/* Difficulty indicator - shows the admin-set difficulty */}
      <div className="difficulty-indicator">
        <span className={`difficulty-badge ${currentVideo.difficulty || 'medium'}`}>
          {difficultyLabels[currentVideo.difficulty || 'medium']}
        </span>
      </div>
      
      <div className="game-content">
        <div className="video-section">
          <div className="video-container">
            <VideoPlayer videoId={currentVideo.youtubeId} />
          </div>
          
          {showCorrectAnswer && (
            <div className="correct-answer">
              <h3>Correct Answer:</h3>
              <p><strong>Meme:</strong> {currentVideo.memeName}</p>
              <p><strong>Date:</strong> {getMonthName(currentVideo.month)} {currentVideo.year}</p>
              <p><strong>Origin:</strong> {currentVideo.country}</p>
            </div>
          )}
        </div>
        
        <div className="controls-section">
          <div className="game-controls">
            <YearMonthPicker
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={handleYearChange}
              onMonthChange={handleMonthChange}
              disabled={!isGuessing}
            />
            
            <MemeNameInput
              memeName={memeName}
              onChange={handleMemeNameChange}
              disabled={!isGuessing}
            />
            
            <CountrySelector
              countries={countries}
              selectedCountry={selectedCountry}
              onChange={handleCountryChange}
              disabled={!isGuessing}
            />
            
            {isGuessing ? (
              <button 
                onClick={handleSubmitGuess} 
                className="guess-button"
                disabled={!memeName.trim()}
              >
                Submit Guess
              </button>
            ) : (
              <button 
                onClick={handleNextVideo} 
                className="next-button"
              >
                Next Meme
              </button>
            )}
          </div>
          
          {feedback && (
            <div className="feedback-container">
              <h3>Results</h3>
              <pre>{feedback}</pre>
            </div>
          )}
          
          <ScoreDisplay score={score} />
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
EOL

echo -e "  ${BLUE}➤ Creating GameScreen.css${NC}"
cat > src/components/Game/GameScreen.css << 'EOL'
/* src/components/Game/GameScreen.css */
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.game-container h1 {
  text-align: center;
  color: var(--secondary-color);
  margin-bottom: 5px;
  font-size: 2.5rem;
}

.game-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.difficulty-indicator {
  text-align: center;
  margin-bottom: 20px;
}

.difficulty-badge {
  display: inline-block;
  padding: 6px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.difficulty-badge.easy {
  background-color: #4caf50;
  color: white;
}

.difficulty-badge.medium {
  background-color: #ff9800;
  color: white;
}

.difficulty-badge.hard {
  background-color: #f44336;
  color: white;
}

.game-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 992px) {
  .game-content {
    grid-template-columns: 3fr 2fr;
  }
}

.video-section {
  display: flex;
  flex-direction: column;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 ratio */
  height: 0;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background-color: #000;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.correct-answer {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid var(--primary-color);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.correct-answer h3 {
  margin-top: 0;
  color: var(--secondary-color);
  margin-bottom: 10px;
}

.correct-answer p {
  margin: 5px 0;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.guess-button,
.next-button {
  padding: 14px;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.guess-button {
  background-color: var(--primary-color);
}

.guess-button:hover:not(:disabled) {
  background-color: #e63900;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.guess-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.next-button {
  background-color: var(--secondary-color);
}

.next-button:hover {
  background-color: #0f0f20;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.feedback-container {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.feedback-container h3 {
  color: var(--secondary-color);
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.feedback-container pre {
  font-family: inherit;
  white-space: pre-wrap;
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.error-container,
.no-videos-container {
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 40px auto;
  max-width: 600px;
}

.error-container h2,
.no-videos-container h2 {
  color: var(--secondary-color);
  margin-top: 0;
  margin-bottom: 15px;
}

.error-container p,
.no-videos-container p {
  margin-bottom: 20px;
  color: #666;
}

.error-container button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-container button:hover {
  background-color: #e63900;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.loading-spinner {
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
EOL

# ----------------------------
# Update Admin Components
# ----------------------------
echo -e "\n${YELLOW}Updating Admin components...${NC}"

# AdminPanel Component
echo -e "  ${BLUE}➤ Creating AdminPanel.js${NC}"
cat > src/components/Admin/AdminPanel.js << 'EOL'
// src/components/Admin/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { countries, memeCategories, getMonths, getMonthName } from '../../data/memeData';
import './AdminPanel.css';

function AdminPanel() {
  const [youtubeId, setYoutubeId] = useState('');
  const [memeName, setMemeName] = useState('');
  const [year, setYear] = useState(2020);
  const [month, setMonth] = useState(1);
  const [country, setCountry] = useState('United States');
  const [category, setCategory] = useState('Image Macros');
  const [difficulty, setDifficulty] = useState('medium');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const months = getMonths();
  
  // Difficulty options
  const difficultyOptions = [
    { value: 'easy', label: 'Easy', description: 'For well-known memes (1x points)' },
    { value: 'medium', label: 'Medium', description: 'For moderately known memes (1.5x points)' },
    { value: 'hard', label: 'Hard', description: 'For obscure or difficult memes (2x points)' }
  ];

  // Get a list of videos on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosCollection = collection(db, 'memeVideos');
        const videoSnapshot = await getDocs(videosCollection);
        const videosList = videoSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setVideos(videosList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setStatus('Error fetching videos: ' + error.message);
        setStatusType('error');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const resetForm = () => {
    setYoutubeId('');
    setMemeName('');
    setYear(2020);
    setMonth(1);
    setCountry('United States');
    setCategory('Image Macros');
    setDifficulty('medium');
    setEditMode(false);
    setEditId(null);
  };

  const handleEditVideo = (video) => {
    setYoutubeId(video.youtubeId);
    setMemeName(video.memeName);
    setYear(video.year);
    setMonth(video.month || 1);
    setCountry(video.country);
    setCategory(video.category || 'Image Macros');
    setDifficulty(video.difficulty || 'medium');
    setEditMode(true);
    setEditId(video.id);
    
    // Scroll to form
    document.querySelector('.video-form-card').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setStatusType('');
    
    try {
      // Validate YouTube ID format (basic validation)
      if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
        setStatus('Invalid YouTube ID format. Should be 11 characters.');
        setStatusType('error');
        return;
      }
      
      // Validate that meme name is provided
      if (!memeName.trim()) {
        setStatus('Please provide the meme name.');
        setStatusType('error');
        return;
      }
      
      const memeData = {
        youtubeId,
        memeName,
        year: parseInt(year),
        month: parseInt(month),
        country,
        category,
        difficulty,
        lastUpdated: serverTimestamp()
      };
      
      if (editMode) {
        // Update existing document
        await updateDoc(doc(db, 'memeVideos', editId), memeData);
        
        // Update the video in the list
        setVideos(prev => prev.map(video => 
          video.id === editId 
            ? { ...video, ...memeData, lastUpdated: new Date() }
            : video
        ));
        
        setStatus('Meme video updated successfully!');
        setStatusType('success');
      } else {
        // Add a new video document to Firestore
        memeData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'memeVideos'), memeData);
        
        // Add the new video to the list with a temporary ID until refresh
        setVideos(prev => [{
          id: docRef.id,
          ...memeData,
          createdAt: new Date(),
          lastUpdated: new Date()
        }, ...prev]);
        
        setStatus('Meme video added successfully!');
        setStatusType('success');
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      setStatus(`Error ${editMode ? 'updating' : 'adding'} meme video: ` + error.message);
      setStatusType('error');
    }
  };
  
  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meme video?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'memeVideos', id));
      setVideos(prev => prev.filter(video => video.id !== id));
      setStatus('Meme video deleted successfully!');
      setStatusType('success');
      
      // If we were editing this video, reset the form
      if (editMode && editId === id) {
        resetForm();
      }
    } catch (error) {
      setStatus('Error deleting video: ' + error.message);
      setStatusType('error');
    }
  };
  
  const handleSignOut = () => {
    signOut(auth).catch(error => {
      console.error("Sign out error:", error);
    });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Meme Timeline Admin</h1>
        <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
      </div>
      
      {status && (
        <div className={`status-message ${statusType}`}>
          {status}
        </div>
      )}
      
      <div className="admin-content">
        <div className="video-form-card">
          <h2>{editMode ? 'Edit Meme Video' : 'Add New Meme Video'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="youtubeId">YouTube Video ID:</label>
              <input 
                id="youtubeId"
                type="text" 
                value={youtubeId} 
                onChange={(e) => setYoutubeId(e.target.value)} 
                placeholder="dQw4w9WgXcQ"
                required 
              />
              <p className="form-help">
                The YouTube ID is the part after "v=" in YouTube URL<br/>
                Example: For https://www.youtube.com/watch?v=dQw4w9WgXcQ, enter "dQw4w9WgXcQ"
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="memeName">Meme Name:</label>
              <input 
                id="memeName"
                type="text" 
                value={memeName} 
                onChange={(e) => setMemeName(e.target.value)} 
                placeholder="Rickroll"
                required 
              />
              <p className="form-help">
                The common name of the meme (e.g., "Distracted Boyfriend", "Doge")
              </p>
            </div>
            
            <div className="date-inputs">
              <div className="form-group month-select">
                <label htmlFor="month">Month:</label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  required
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group year-select">
                <label htmlFor="year">Year:</label>
                <input 
                  id="year"
                  type="number" 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  min="1995" 
                  max="2024" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country of Origin:</label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="form-help">
                The country where the meme originated
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Meme Category:</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {memeCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group difficulty-selection">
              <label>Difficulty Level:</label>
              <div className="difficulty-options">
                {difficultyOptions.map(option => (
                  <div 
                    key={option.value}
                    className={`difficulty-option ${difficulty === option.value ? 'selected' : ''}`}
                    onClick={() => setDifficulty(option.value)}
                  >
                    <div className={`difficulty-label ${option.value}`}>{option.label}</div>
                    <div className="difficulty-description">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-buttons">
              {editMode && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="submit-button">
                {editMode ? 'Update Meme' : 'Add Meme'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="video-list-card">
          <h2>Existing Meme Videos</h2>
          
          {loading ? (
            <div className="loading-videos">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="no-videos">No meme videos added yet.</div>
          ) : (
            <div className="video-list">
              {videos.map(video => (
                <div key={video.id} className="video-item">
                  <div className="video-thumbnail">
                    <a 
                      href={`https://www.youtube.com/watch?v=${video.youtubeId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                        alt="Video thumbnail" 
                      />
                    </a>
                    <div className={`difficulty-tag ${video.difficulty || 'medium'}`}>
                      {video.difficulty ? video.difficulty.charAt(0).toUpperCase() + video.difficulty.slice(1) : 'Medium'}
                    </div>
                  </div>
                  <div className="video-details">
                    <h3>{video.memeName}</h3>
                    <p><strong>Date:</strong> {getMonthName(video.month || 1)} {video.year}</p>
                    <p><strong>Origin:</strong> {video.country}</p>
                    <div className="video-actions">
                      <button 
                        onClick={() => handleEditVideo(video)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteVideo(video.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
EOL

echo -e "  ${BLUE}➤ Creating AdminPanel.css${NC}"
cat > src/components/Admin/AdminPanel.css << 'EOL'
/* src/components/Admin/AdminPanel.css */
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  color: var(--secondary-color);
  margin: 0;
  font-size: 2rem;
}

.sign-out-button {
  background-color: #f5f5f5;
  color: var(--text-color);
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s ease;
  padding: 10px 16px;
}

.sign-out-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

.admin-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 992px) {
  .admin-content {
    grid-template-columns: 1fr 1fr;
  }
}

.video-form-card,
.video-list-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
}

.video-form-card h2,
.video-list-card h2 {
  color: var(--secondary-color);
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
  text-align: center;
}

.form-help {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;
}

.date-inputs {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.month-select {
  flex: 1;
}

.year-select {
  flex: 1;
}

/* Difficulty selection */
.difficulty-selection {
  margin-top: 20px;
}

.difficulty-options {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.difficulty-option {
  flex: 1;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.difficulty-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.difficulty-option.selected {
  border-color: var(--primary-color);
  background-color: rgba(255, 69, 0, 0.05);
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.difficulty-label {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 1.1rem;
  padding: 5px 0;
  border-radius: 5px;
  color: white;
}

.difficulty-label.easy {
  background-color: #4caf50;
}

.difficulty-label.medium {
  background-color: #ff9800;
}

.difficulty-label.hard {
  background-color: #f44336;
}

.difficulty-description {
  font-size: 0.8rem;
  color: #666;
}

.form-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.cancel-button {
  flex: 1;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

.submit-button {
  flex: 2;
  margin-top: 0;
  background-color: var(--primary-color);
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.submit-button:hover {
  background-color: #e63900;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.status-message {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-message.success {
  background-color: #e8f5e9;
  color: var(--success-color);
  border: 1px solid #c8e6c9;
}

.status-message.error {
  background-color: #ffebee;
  color: var(--error-color);
  border: 1px solid #ffcdd2;
}

.video-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-height: 700px;
  overflow-y: auto;
  padding-right: 8px;
}

.video-item {
  display: flex;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.video-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #ddd;
}

.video-thumbnail {
  flex: 0 0 120px;
  position: relative;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.difficulty-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
}

.difficulty-tag.easy {
  background-color: #4caf50;
}

.difficulty-tag.medium {
  background-color: #ff9800;
}

.difficulty-tag.hard {
  background-color: #f44336;
}

.video-details {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.video-details h3 {
  margin: 0 0 10px 0;
  color: var(--secondary-color);
  font-size: 1.2rem;
}

.video-details p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.video-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 15px;
}

.edit-button,
.delete-button {
  padding: 8px 12px;
  font-size: 0.9rem;
}

.edit-button {
  background-color: #2196f3;
  color: white;
}

.edit-button:hover {
  background-color: #0d8aee;
}

.delete-button {
  background-color: var(--error-color);
  color: white;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.no-videos,
.loading-videos {
  padding: 40px 20px;
  text-align: center;
  color: #777;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

/* Scrollbar styling */
.video-list::-webkit-scrollbar {
  width: 8px;
}

.video-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.video-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.video-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Form styling */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--secondary-color);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .difficulty-options {
    flex-direction: column;
  }
  
  .date-inputs {
    flex-direction: column;
  }
}
EOL

# Update the memeData.js file to include scoring functions
echo -e "\n${YELLOW}Updating memeData.js...${NC}"
cat > src/data/memeData.js << 'EOL'
// src/data/memeData.js

// Countries list for meme origins
export const countries = [
  'United States',
  'United Kingdom',
  'Japan',
  'South Korea',
  'Russia',
  'Canada',
  'Australia',
  'Brazil',
  'India',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Mexico',
  'Sweden',
  'Poland',
  'Netherlands',
  'China',
  'Finland',
  'Global/Internet',
  'Other'
];

// Some popular meme categories to help with organization
export const memeCategories = [
  'Image Macros',
  'Reaction GIFs',
  'Video Memes',
  'Social Media Trends',
  'TV/Movie References',
  'Music Memes',
  'Gaming Memes',
  'Animal Memes',
  'Celebrity Memes',
  'Political Memes',
  'Viral Challenges',
  'Rage Comics',
  'Wholesome Memes',
  'Absurdist Memes',
  'Internet Culture'
];

// Example popular memes from the last 25 years to help with testing
export const popularMemes = [
  { name: "Dancing Baby", year: 1996, month: 10, country: "United States" },
  { name: "All Your Base Are Belong To Us", year: 1999, month: 2, country: "Japan" },
  { name: "Rickroll", year: 2007, month: 5, country: "United States" },
  { name: "Doge", year: 2013, month: 7, country: "Japan" },
  { name: "Distracted Boyfriend", year: 2017, month: 8, country: "Spain" },
  { name: "Tide Pod Challenge", year: 2018, month: 1, country: "United States" },
  { name: "Woman Yelling at Cat", year: 2019, month: 5, country: "United States" },
  { name: "Bernie Sanders Mittens", year: 2021, month: 1, country: "United States" },
  { name: "One Does Not Simply", year: 2011, month: 6, country: "United States" },
  { name: "Gangnam Style", year: 2012, month: 7, country: "South Korea" },
  { name: "Harlem Shake", year: 2013, month: 2, country: "United States" },
  { name: "Ice Bucket Challenge", year: 2014, month: 7, country: "United States" },
  { name: "The Dress", year: 2015, month: 2, country: "United Kingdom" },
  { name: "Harambe", year: 2016, month: 5, country: "United States" },
  { name: "Salt Bae", year: 2017, month: 1, country: "Turkey" },
  { name: "Baby Shark", year: 2018, month: 6, country: "South Korea" },
  { name: "Area 51 Raid", year: 2019, month: 7, country: "United States" },
  { name: "Tiger King", year: 2020, month: 3, country: "United States" },
  { name: "Sea Shanty TikTok", year: 2021, month: 1, country: "United Kingdom" },
  { name: "Everything Everywhere All at Once", year: 2022, month: 3, country: "United States" },
  { name: "Barbie vs Oppenheimer", year: 2023, month: 7, country: "United States" }
];

// Function to get all months for display
export function getMonths() {
  return [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];
}

// Function to get a month name from its number
export function getMonthName(monthNumber) {
  const months = getMonths();
  const month = months.find(m => m.value === monthNumber);
  return month ? month.label : "Unknown";
}

// Calculate score based on how close the guess is to the actual date
export function calculateDateScore(guessYear, guessMonth, actualYear, actualMonth) {
  // Convert years and months to total months for easier comparison
  const guessMonths = (guessYear * 12) + guessMonth;
  const actualMonths = (actualYear * 12) + actualMonth;
  
  // Calculate absolute difference in months
  const monthsDifference = Math.abs(guessMonths - actualMonths);
  
  // Scoring logic: 
  // Perfect: 50 points
  // Within 1 month: 30 points
  // Within 3 months: 20 points
  // Within 6 months: 15 points
  // Within 12 months: 10 points
  // Within 24 months: 5 points
  // More than 24 months: 0 points
  
  if (monthsDifference === 0) {
    return { score: 50, feedback: "Perfect date match! +50 points" };
  } else if (monthsDifference <= 1) {
    return { score: 30, feedback: "Just 1 month off! +30 points" };
  } else if (monthsDifference <= 3) {
    return { score: 20, feedback: "Within 3 months! +20 points" };
  } else if (monthsDifference <= 6) {
    return { score: 15, feedback: "Within 6 months! +15 points" };
  } else if (monthsDifference <= 12) {
    return { score: 10, feedback: "Within a year! +10 points" };
  } else if (monthsDifference <= 24) {
    return { score: 5, feedback: "Within 2 years! +5 points" };
  } else {
    return { score: 0, feedback: "More than 2 years off! +0 points" };
  }
}

// Calculate score for correct country
export function calculateCountryScore(guessCountry, actualCountry) {
  if (guessCountry === actualCountry) {
    return { score: 20, feedback: "Correct country! +20 points" };
  }
  return { score: 0, feedback: `Wrong country! The correct country was ${actualCountry}. +0 points` };
}

// Calculate score for correct meme name
export function calculateMemeNameScore(guessName, actualName) {
  // Case insensitive comparison
  if (guessName.toLowerCase() === actualName.toLowerCase()) {
    return { score: 30, feedback: "Correct meme name! +30 points" };
  }
  return { score: 0, feedback: `Wrong meme name! It was "${actualName}". +0 points` };
}
EOL

# Make the script executable
chmod +x ui-upgrade.sh

echo -e "\n${GREEN}UI upgrade script created successfully!${NC}"
echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}              NEXT STEPS:               ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${YELLOW}1. Run this script in your meme-timeline-game project directory${NC}"
echo -e "${YELLOW}2. Restart your development server after running the script:${NC}"
echo -e "   npm start"
echo -e "${YELLOW}3. The UI will now have enhanced controls, admin-only difficulty, and improved visuals${NC}"
echo -e "\n${GREEN}Enjoy your upgraded Meme Timeline Game!${NC}"
