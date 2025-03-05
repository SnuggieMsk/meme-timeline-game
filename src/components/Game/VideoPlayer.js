// src/components/Game/VideoPlayer.js
import React from 'react';

function VideoPlayer({ videoId }) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&loop=1&modestbranding=1&rel=0&showinfo=0&mute=0`}
      title="YouTube video player"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    ></iframe>
  );
}

export default VideoPlayer;
