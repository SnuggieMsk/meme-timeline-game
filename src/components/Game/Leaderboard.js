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
