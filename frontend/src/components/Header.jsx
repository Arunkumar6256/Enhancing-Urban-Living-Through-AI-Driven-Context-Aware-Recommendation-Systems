import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { AuthContext } from '../utils/AuthContext';

export default function Header() {
  const { token, setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setToken(null);
    navigate('/');
  };

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold font-heading text-[var(--primary)] no-underline">
          SmartCity
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}>Home</Link>
          <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>Map</Link>
          <Link to="/recommend" className={`nav-link ${location.pathname === '/recommend' ? 'active' : ''}`}>Services</Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {token ? (
            <button onClick={handleLogout} className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)]">
              Logout
            </button>
          ) : (
            <Link to="/auth-choice" className="btn text-sm no-underline">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
