import React from 'react'
import "../styles/LandingPage.scss";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <h3>Decodream</h3>
              <p>Dream Analysis on the Internet Computer</p>
            </div>
            <p className="footer-description">
              Using the power of artificial intelligence to help you understand the meaning behind your dreams.
            </p>
            <p className="copyright">© 2025 Decodream. All rights reserved.</p>
          </div>
          
          <div className="footer-links-container">
            <div className="footer-links-column">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/security">Security</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/blog">Dream Blog</Link></li>
                <li><Link to="/support">Support</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
