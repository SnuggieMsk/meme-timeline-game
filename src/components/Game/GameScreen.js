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
