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
