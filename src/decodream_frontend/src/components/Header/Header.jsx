import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { isLoggedIn, identity, login, logout, isAuthenticating } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && 
          !event.target.classList.contains('mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Format principal ID for display
  const formatPrincipalId = (principal) => {
    if (!principal) return '';
    const principalStr = principal.toString();
    return principalStr.length > 10 
      ? `${principalStr.substring(0, 8)}...` 
      : principalStr;
  };

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">Decodream</Link>
            <p className="tagline-header">Dream Analysis on the Internet Computer</p>
          </div>
          
          {/* Improved mobile menu toggle button with aria attributes */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true"></i>
            <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
          
          <nav 
            ref={navRef}
            id="main-navigation" 
            className={`main-nav ${mobileMenuOpen ? 'show' : ''}`}
            aria-hidden={!mobileMenuOpen && window.innerWidth <= 768}
          >
            {isLoggedIn ? (
              <div className="auth-container">
                <div className="user-principal" title={identity?.getPrincipal()?.toString()}>
                  <span className="principal-label">Principal ID:</span> 
                  <span className="principal-value">
                    {formatPrincipalId(identity?.getPrincipal())}
                  </span>
                </div>
                <Link 
                  to="/dreams" 
                  className="nav-link" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-book-open nav-icon" aria-hidden="true"></i> 
                  <span>My Dreams</span>
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }} 
                  disabled={isAuthenticating}
                  className="nav-btn"
                  aria-busy={isAuthenticating}
                >
                  <i className="fas fa-sign-out-alt nav-icon" aria-hidden="true"></i>
                  <span>{isAuthenticating ? "Processing..." : "Logout"}</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  login();
                  setMobileMenuOpen(false);
                }} 
                disabled={isAuthenticating}
                className="nav-btn"
                aria-busy={isAuthenticating}
              >
                <i className="fas fa-sign-in-alt nav-icon" aria-hidden="true"></i>
                <span>{isAuthenticating ? "Connecting..." : "Login with Internet Identity"}</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;