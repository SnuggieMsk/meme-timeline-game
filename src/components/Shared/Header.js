// src/components/Shared/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ user }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">Meme Timeline</Link>
        </div>
        <nav className="navigation">
          <Link to="/" className="nav-link">Game</Link>
          {user ? (
            <Link to="/admin" className="nav-link">Admin</Link>
          ) : (
            <Link to="/login" className="nav-link">Admin Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
