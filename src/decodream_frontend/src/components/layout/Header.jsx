import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../styles/Header.scss";

const Header = () => {
  const { isLoggedIn, identity, login, logout, isAuthenticating } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const formatPrincipalId = (principal) => {
    if (!principal) return '';
    const principalStr = principal.toString();
    return principalStr.length > 10 
      ? `${principalStr.substring(0, 5)}...${principalStr.substring(principalStr.length - 5)}` 
      : principalStr;
  };

  return (
    <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <span>Decodream</span>
            </Link>
            <p className="tagline-header">Dream Analysis on the Internet Computer</p>
          </div>
          
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
          >
            <span className="menu-icon">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </span>
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
                <div className="nav-links">
                  <Link 
                    to="/dreams" 
                    className={`nav-link ${location.pathname === '/dreams' ? 'active' : ''}`} 
                  >
                    <i className="fas fa-book-open nav-icon" aria-hidden="true"></i> 
                    <span>My Dreams</span>
                  </Link>

                  <Link 
                    to="/nft-gallery" 
                    className={`nav-link ${location.pathname === '/nft-gallery' ? 'active' : ''}`}
                  >
                    <i className="fas fa-gem"></i> 
                    <span>NFT Gallery</span>
                  </Link>
                </div>

                <div className="user-section">
                  <div className="user-principal" title={identity?.getPrincipal()?.toString()}>
                    <span className="principal-label">ID:</span> 
                    <span className="principal-value">
                      {formatPrincipalId(identity?.getPrincipal())}
                    </span>
                    <span className="user-status">
                      <span className="status-dot"></span>
                      <span className="status-text">Connected</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => logout()} 
                    disabled={isAuthenticating}
                    className={`nav-btn logout-btn ${isAuthenticating ? 'loading' : ''}`}
                    aria-busy={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <>
                        <span className="spinner"></span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-out-alt nav-icon" aria-hidden="true"></i>
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-container guest-container">
                <div className="nav-links">
                  <Link 
                    to="/dreams" 
                    className={`nav-link ${location.pathname === '/dreams' ? 'active' : ''}`} 
                  >
                    <i className="fas fa-feather-alt nav-icon" aria-hidden="true"></i> 
                    <span>Try It Out</span>
                  </Link>
                </div>
                
                <button 
                  onClick={() => login()} 
                  disabled={isAuthenticating}
                  className={`nav-btn login-btn ${isAuthenticating ? 'loading' : ''}`}
                  aria-busy={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <>
                      <span className="spinner"></span>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt nav-icon" aria-hidden="true"></i>
                      <span>Login with Internet Identity</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;