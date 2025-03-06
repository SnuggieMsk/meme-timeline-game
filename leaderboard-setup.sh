#!/bin/bash
# leaderboard-setup.sh - Install the leaderboard feature

# Set text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}    Meme Timeline Leaderboard Setup    ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if we're in the project directory
if [ ! -f "package.json" ] || ! grep -q "meme-timeline-game" "package.json"; then
  echo -e "${RED}Error: This script must be run from the meme-timeline-game project root directory${NC}"
  echo -e "${YELLOW}Please navigate to your project directory and try again${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Setting up leaderboard feature...${NC}"

# Create Leaderboard component file
echo -e "${GREEN}Creating Leaderboard component...${NC}"
cat > src/components/Game/Leaderboard.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, addDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import './Leaderboard.css';

function Leaderboard({ currentScore, onClose }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('all-time');
  const [userRank, setUserRank] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Time frame options
  const timeFrames = [
    { id: 'all-time', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'daily', label: 'Today' }
  ];
  
  // Fetch leaderboard data on component mount and when timeFrame changes
  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);
  
  // Determine if current score qualifies for leaderboard
  useEffect(() => {
    if (currentScore > 0 && leaderboardData.length > 0) {
      // Check if score is higher than the lowest on the leaderboard
      // or if the leaderboard isn't full yet (less than 10 entries)
      if (leaderboardData.length < 10 || currentScore > leaderboardData[leaderboardData.length - 1].score) {
        setShowNameInput(true);
      }
      
      // Find user's potential rank
      const rank = leaderboardData.findIndex(entry => currentScore > entry.score) + 1;
      if (rank > 0) {
        setUserRank(rank);
      } else if (leaderboardData.length < 10) {
        setUserRank(leaderboardData.length + 1);
      }
    }
  }, [currentScore, leaderboardData]);
  
  // Fetch leaderboard data from Firestore
  const fetchLeaderboard = async () => {
    setLoading(true);
    
    try {
      // Create query based on selected time frame
      let leaderboardQuery;
      const leaderboardCollection = collection(db, 'leaderboard');
      
      if (timeFrame === 'weekly') {
        // Get scores from the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        leaderboardQuery = query(
          leaderboardCollection,
          where('timestamp', '>=', oneWeekAgo),
          orderBy('timestamp', 'desc'),
          orderBy('score', 'desc'),
          limit(10)
        );
      } else if (timeFrame === 'daily') {
        // Get scores from today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        leaderboardQuery = query(
          leaderboardCollection,
          where('timestamp', '>=', startOfDay),
          orderBy('timestamp', 'desc'),
          orderBy('score', 'desc'),
          limit(10)
        );
      } else {
        // All time top scores
        leaderboardQuery = query(
          leaderboardCollection,
          orderBy('score', 'desc'),
          limit(10)
        );
      }
      
      const querySnapshot = await getDocs(leaderboardQuery);
      const data = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));
      
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit score to leaderboard
  const handleSubmitScore = async (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Create a new leaderboard entry
      const newEntry = {
        name: playerName.trim(),
        score: currentScore,
        timestamp: new Date()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'leaderboard'), newEntry);
      
      // Add the new entry to the local leaderboard data
      const newLeaderboardData = [...leaderboardData];
      
      // Insert the new entry at the correct position
      if (userRank) {
        newLeaderboardData.splice(userRank - 1, 0, { 
          id: docRef.id, 
          rank: userRank, 
          ...newEntry,
          isCurrentUser: true
        });
        
        // Update ranks for entries after the insert
        for (let i = userRank; i < newLeaderboardData.length; i++) {
          newLeaderboardData[i].rank = i + 1;
        }
        
        // Keep only top 10
        if (newLeaderboardData.length > 10) {
          newLeaderboardData.pop();
        }
      }
      
      setLeaderboardData(newLeaderboardData);
      setShowNameInput(false);
    } catch (err) {
      console.error('Error submitting score:', err);
      setError('Failed to submit your score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="time-frame-selector">
        {timeFrames.map(frame => (
          <button
            key={frame.id}
            className={`time-frame-button ${timeFrame === frame.id ? 'active' : ''}`}
            onClick={() => setTimeFrame(frame.id)}
          >
            {frame.label}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading leaderboard...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.length > 0 ? (
                leaderboardData.map(entry => (
                  <tr key={entry.id} className={entry.isCurrentUser ? 'current-user' : ''}>
                    <td className="rank-cell">
                      {entry.rank <= 3 ? 
                        <span className={`trophy trophy-${entry.rank}`}>🏆</span> :
                        `#${entry.rank}`
                      }
                    </td>
                    <td>{entry.name}</td>
                    <td className="score-cell">{entry.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No scores yet. Be the first!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showNameInput && (
        <div className="submit-score-form">
          <h3>You made the leaderboard!</h3>
          <p>You're ranked #{userRank} with a score of {currentScore}</p>
          
          <form onSubmit={handleSubmitScore}>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={20}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Score'}
            </button>
          </form>
          
          {error && <div className="input-error">{error}</div>}
        </div>
      )}
      
      {currentScore > 0 && !showNameInput && (
        <div className="current-score-display">
          <p>Your current score: <strong>{currentScore}</strong></p>
          {userRank ? (
            <p>Keep playing to improve your rank!</p>
          ) : (
            <p>Score more points to make it to the leaderboard!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
EOL

# Create Leaderboard CSS file
echo -e "${GREEN}Creating Leaderboard styles...${NC}"
cat > src/components/Game/Leaderboard.css << 'EOL'
/* src/components/Game/Leaderboard.css */
.leaderboard-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 20px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.leaderboard-header h2 {
  margin: 0;
  color: var(--secondary-color);
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f5f5f5;
  color: #666;
}

.time-frame-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
}

.time-frame-button {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.time-frame-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.time-frame-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  font-weight: 600;
}

.leaderboard-table-container {
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.leaderboard-table th {
  padding: 12px 10px;
  background-color: #f9f9f9;
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
}

.leaderboard-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

.leaderboard-table tr:last-child td {
  border-bottom: none;
}

.leaderboard-table tr.current-user {
  background-color: rgba(255, 69, 0, 0.05);
  font-weight: 600;
}

.rank-cell {
  width: 60px;
  text-align: center;
  font-weight: 600;
}

.score-cell {
  text-align: right;
  color: var(--primary-color);
  font-weight: 600;
}

.trophy {
  font-size: 1.2rem;
}

.trophy-1 {
  color: gold;
}

.trophy-2 {
  color: silver;
}

.trophy-3 {
  color: #cd7f32; /* bronze */
}

.no-data {
  text-align: center;
  color: #999;
  padding: 30px 10px !important;
}

.loading-indicator {
  text-align: center;
  padding: 30px 0;
  color: #666;
}

.error-message {
  color: var(--error-color);
  text-align: center;
  padding: 15px;
  background-color: #ffebee;
  border-radius: 8px;
  margin: 15px 0;
}

.submit-score-form {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
  animation: fadeIn 0.5s ease;
}

.submit-score-form h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.submit-score-form p {
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.submit-score-form form {
  display: flex;
  gap: 10px;
}

.submit-score-form input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-score-form input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.1);
}

.submit-score-form button {
  padding: 10px 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.submit-score-form button:hover:not(:disabled) {
  background-color: #e63900;
}

.submit-score-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.input-error {
  color: var(--error-color);
  font-size: 0.85rem;
  margin-top: 10px;
}

.current-score-display {
  text-align: center;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.current-score-display p {
  margin: 5px 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .submit-score-form form {
    flex-direction: column;
  }
  
  .submit-score-form button {
    width: 100%;
  }
  
  .time-frame-selector {
    flex-wrap: wrap;
  }
  
  .time-frame-button {
    flex: 1;
    min-width: 80px;
    text-align: center;
  }
}
EOL

# Update GameScreen.css with leaderboard styles
echo -e "${GREEN}Updating GameScreen.css...${NC}"
cat >> src/components/Game/GameScreen.css << 'EOL'

/* Leaderboard integration styles */
.difficulty-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.leaderboard-button {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.leaderboard-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Modal styles for leaderboard */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

/* Game over modal */
.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.game-over-modal {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: bounceIn 0.5s ease;
}

.game-over-modal h2 {
  color: var(--primary-color);
  margin-top: 0;
  font-size: 2rem;
  margin-bottom: 15px;
}

.game-over-modal p {
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.game-over-modal p strong {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.game-over-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 25px;
}

.submit-score-button,
.view-leaderboard-button {
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-score-button:hover,
.view-leaderboard-button:hover {
  background-color: #e63900;
  transform: translateY(-2px);
}

.skip-button {
  padding: 12px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-button:hover {
  background-color: #e9e9e9;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

@media (max-width: 480px) {
  .game-over-modal {
    padding: 20px;
  }
}
EOL

# Update GameScreen.js to include leaderboard functionality
echo -e "${GREEN}Updating GameScreen.js...${NC}"

# Create a temporary file with modifications
cat > .gamescreen_temp.js << 'EOL'
// Import the Leaderboard component
import Leaderboard from './Leaderboard';

// Add these state variables to the existing state variables:
const [showLeaderboard, setShowLeaderboard] = useState(false);
const [scoreThreshold, setScoreThreshold] = useState(50); // Minimum score to show leaderboard option
const [gameOver, setGameOver] = useState(false);
const [gamesPlayed, setGamesPlayed] = useState(0);

// Add this useEffect hook to load games played count:
// Load games played count from localStorage
useEffect(() => {
  const savedGamesPlayed = localStorage.getItem('gamesPlayed');
  if (savedGamesPlayed) {
    setGamesPlayed(parseInt(savedGamesPlayed, 10));
  }
}, []);

// Modify the handleNextVideo function:
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
  
  // Increment games played
  const newGamesPlayed = gamesPlayed + 1;
  setGamesPlayed(newGamesPlayed);
  localStorage.setItem('gamesPlayed', newGamesPlayed.toString());
  
  // Check if game should end (for example, after 5 rounds)
  if (newGamesPlayed % 5 === 0) {
    setGameOver(true);
  }
};

// Add these new functions:
const handleLeaderboardClose = () => {
  setShowLeaderboard(false);
  setGameOver(false);
  
  // If game was over when leaderboard was shown, reset score
  if (gameOver) {
    setScore(0);
    localStorage.setItem('memeGameScore', '0');
    setGamesPlayed(0);
    localStorage.setItem('gamesPlayed', '0');
  }
};

const handleViewLeaderboard = () => {
  setShowLeaderboard(true);
};

const handleSkipLeaderboard = () => {
  setGameOver(false);
  setScore(0);
  localStorage.setItem('memeGameScore', '0');
  setGamesPlayed(0);
  localStorage.setItem('gamesPlayed', '0');
};

// Add a leaderboard button to the difficulty indicator:
<div className="difficulty-indicator">
  <span className={`difficulty-badge ${currentVideo.difficulty || 'medium'}`}>
    {difficultyLabels[currentVideo.difficulty || 'medium']}
  </span>
  
  {/* Leaderboard button */}
  <button 
    className="leaderboard-button"
    onClick={handleViewLeaderboard}
    title="View Leaderboard"
  >
    🏆 Leaderboard
  </button>
</div>

// Add these components at the end of the return statement:
{/* Game over modal */}
{gameOver && !showLeaderboard && (
  <div className="game-over-overlay">
    <div className="game-over-modal">
      <h2>Game Over!</h2>
      <p>You've completed 5 rounds!</p>
      <p>Your final score: <strong>{score}</strong></p>
      
      <div className="game-over-buttons">
        {score >= scoreThreshold ? (
          <button 
            className="submit-score-button"
            onClick={handleViewLeaderboard}
          >
            Submit to Leaderboard
          </button>
        ) : (
          <button 
            className="view-leaderboard-button"
            onClick={handleViewLeaderboard}
          >
            View Leaderboard
          </button>
        )}
        
        <button 
          className="skip-button"
          onClick={handleSkipLeaderboard}
        >
          Start New Game
        </button>
      </div>
    </div>
  </div>
)}

{/* Leaderboard modal */}
{showLeaderboard && (
  <div className="modal-overlay">
    <div className="modal-container">
      <Leaderboard 
        currentScore={score} 
        onClose={handleLeaderboardClose} 
      />
    </div>
  </div>
)}
EOL

echo -e "${YELLOW}The GameScreen.js has many changes. You'll need to manually add the leaderboard components.${NC}"
echo -e "${YELLOW}See the file .gamescreen_temp.js for the code snippets to add.${NC}"

# Create Firebase security rules file
echo -e "${GREEN}Creating Firestore security rules...${NC}"
cat > firestore.rules << 'EOL'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read leaderboard entries
    match /leaderboard/{entry} {
      allow read: true;
      
      // Allow creation of new entries with validation
      allow create: if
        // Name must be provided and between 2-20 characters
        request.resource.data.name is string &&
        request.resource.data.name.size() >= 2 &&
        request.resource.data.name.size() <= 20 &&
        
        // Score must be a number and reasonable (prevent cheating)
        request.resource.data.score is number &&
        request.resource.data.score >= 0 &&
        request.resource.data.score <= 1000 && // Set a reasonable maximum
        
        // Must include a timestamp
        request.resource.data.timestamp is timestamp;
      
      // Users can't update or delete scores
      allow update, delete: if false;
    }
    
    // Add other Firestore rules for existing collections
    match /memeVideos/{document=**} {
      allow read: true;
      allow write: if request.auth != null;
    }
  }
}
EOL

# Final instructions
echo -e "\n${GREEN}Leaderboard setup complete!${NC}"
echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}              NEXT STEPS:               ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${YELLOW}1. Update GameScreen.js with the leaderboard components${NC}"
echo -e "   See .gamescreen_temp.js for the code to add"
echo -e "${YELLOW}2. Deploy the updated Firestore security rules:${NC}"
echo -e "   firebase deploy --only firestore:rules"
echo -e "${YELLOW}3. Create the leaderboard collection in Firebase Console${NC}"
echo -e "${YELLOW}4. Test the leaderboard by playing the game and achieving a score${NC}"
echo -e "\n${GREEN}Your meme timeline game now has a competitive leaderboard!${NC}"
