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
  const [difficulty, setDifficulty] = useState('medium');
  const [error, setError] = useState('');

  // Game difficulty levels - now affects scoring multiplier
  const DIFFICULTY_SETTINGS = {
    easy: { multiplier: 1.0, label: 'Easy' },
    medium: { multiplier: 1.5, label: 'Medium' },
    hard: { multiplier: 2.0, label: 'Hard' }
  };

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

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  const handleSubmitGuess = () => {
    if (!currentVideo) return;
    
    // Get the multiplier for the selected difficulty
    const { multiplier } = DIFFICULTY_SETTINGS[difficulty];
    
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
    const totalScore = Math.round((dateResult.score + countryResult.score + nameResult.score) * multiplier);
    
    // Create feedback
    const dateFeedback = `${dateResult.feedback} The correct date was ${getMonthName(currentVideo.month)} ${currentVideo.year}.`;
    const feedbackText = `
      ${dateFeedback}
      ${countryResult.feedback}
      ${nameResult.feedback}
      
      Total points: ${totalScore} (${multiplier}x multiplier for ${difficulty} difficulty)
    `;
    
    // Update score and feedback
    const newScore = score + totalScore;
    setScore(newScore);
    localStorage.setItem('memeGameScore', newScore.toString());
    
    setFeedback(feedbackText);
    setIsGuessing(false);
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

  return (
    <div className="game-container">
      <h1>Meme Timeline Challenge</h1>
      <p className="game-subtitle">Guess when and where the meme originated!</p>
      
      <div className="difficulty-selector">
        <label>Difficulty:</label>
        <div className="difficulty-buttons">
          {Object.entries(DIFFICULTY_SETTINGS).map(([key, { label }]) => (
            <button
              key={key}
              className={`difficulty-button ${difficulty === key ? 'active' : ''}`}
              onClick={() => handleDifficultyChange(key)}
              disabled={!isGuessing}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="game-content">
        <div className="video-container">
          <VideoPlayer videoId={currentVideo.youtubeId} />
        </div>
        
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
      </div>
      
      {feedback && (
        <div className="feedback-container">
          <h3>Results</h3>
          <pre>{feedback}</pre>
        </div>
      )}
      
      <ScoreDisplay score={score} />
    </div>
  );
}

export default GameScreen;
