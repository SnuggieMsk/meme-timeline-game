// src/components/Shared/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>Meme Timeline Game &copy; {currentYear}</p>
        <p>Test your knowledge of internet culture from 1995-{currentYear}</p>
      </div>
    </footer>
  );
}

export default Footer;
