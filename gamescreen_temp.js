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
