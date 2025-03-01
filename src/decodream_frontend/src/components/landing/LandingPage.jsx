import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LandingPage.css";
import Header from "../Header/Header";

const LandingPage = () => {
  const { isLoggedIn, identity, login, logout, isAuthenticating } = useAuth();

  return (
    <>
      {/* Header/Navigation */}
      <Header />

      {/* Main Content */}
        <div className="landing-page">
          <div className="hero-section">
            <div className="container">
              <div className="hero-content">
                <div className="hero-text">
                  <h1>Unlock Your Dream Insights</h1>
                  <p className="tagline">Discover the hidden meanings behind your dreams with AI-powered analysis</p>
                  <div className="hero-cta">
                    {isLoggedIn ? (
                      <Link to="/dreams" className="btn btn-primary">
                        <i className="fas fa-book-open btn-icon"></i> Go to My Dreams
                      </Link>
                    ) : (
                      <button 
                        onClick={login} 
                        disabled={isAuthenticating}
                        className="btn btn-primary"
                      >
                        <i className="fas fa-sign-in-alt btn-icon"></i>
                        {isAuthenticating ? "Connecting..." : "Login with Internet Identity"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="hero-image">
                  <div className="dream-illustration">
                    <div className="dream-cloud"></div>
                    <div className="dream-stars">
                      <div className="star star-1"></div>
                      <div className="star star-2"></div>
                      <div className="star star-3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-wave">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                <path fill="#ffffff" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>
          </div>
          
          <div className="features-section">
            <div className="container">
              <div className="section-header">
                <h2>How Decodream Works</h2>
                <p className="section-description">Our platform provides powerful tools to help you understand your subconscious</p>
              </div>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="icon-container">
                    <img 
                      src="/images/record_dreams.png" 
                      alt="Record Dreams" 
                      className="feature-icon" 
                    />
                  </div>
                  <h3>Record Dreams</h3>
                  <p>
                    Quickly document your dreams in our intuitive interface before they fade from memory
                  </p>
                </div>
                
                <div className="feature-card">
                  <div className="icon-container">
                    <img 
                      src="/images/analyze_dream.png" 
                      alt="Analyze Patterns" 
                      className="feature-icon" 
                    />
                  </div>
                  <h3>Analyze Patterns</h3>
                  <p>
                    Discover recurring themes and symbols in your dream journal with our pattern recognition technology
                  </p>
                </div>
                
                <div className="feature-card">
                  <div className="icon-container">
                    <img 
                      src="/images/ai_insight.png" 
                      alt="AI Insights" 
                      className="feature-icon" 
                    />
                  </div>
                  <h3>AI Insights</h3>
                  <p>
                    Get personalized interpretations of your dreams powered by advanced AI on the Internet Computer
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="how-it-works-section">
            <div className="container">
              <div className="section-header">
                <h2>Simple Three-Step Process</h2>
                <p className="section-description">Start gaining insights into your dreams today</p>
              </div>
              
              <div className="steps-container">
                <div className="step">
                  <div className="step-number">1</div>
                  <h3>Sign In</h3>
                  <p>Connect with Internet Identity for secure and anonymous access</p>
                </div>
                <div className="step-connector"></div>
                <div className="step">
                  <div className="step-number">2</div>
                  <h3>Record Dream</h3>
                  <p>Document your dream with as much detail as you can remember</p>
                </div>
                <div className="step-connector"></div>
                <div className="step">
                  <div className="step-number">3</div>
                  <h3>Get Analysis</h3>
                  <p>Receive personalized insights and interpretations instantly</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonials-section">
            <div className="container">
              <div className="section-header">
                <h2>What Our Users Say</h2>
                <p className="section-description">Join thousands of dreamers who've gained insights into their subconscious mind</p>
              </div>
              
              <div className="testimonials-grid">
                <div className="testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p>This app has helped me understand my recurring dreams about flying. The AI analysis pointed out connections I never would have made myself. Highly recommended!</p>
                  <div className="user">
                    <div className="avatar"></div>
                    <div className="user-info">
                      <p className="name">Sarah J.</p>
                      <p className="location">Dream Explorer since 2024</p>
                    </div>
                  </div>
                </div>
                
                <div className="testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p>I've been journaling my dreams for years, but the AI analysis takes it to another level. It helped me identify patterns across months of entries that revealed important insights about my waking life.</p>
                  <div className="user">
                    <div className="avatar"></div>
                    <div className="user-info">
                      <p className="name">Michael T.</p>
                      <p className="location">Dream Explorer since 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pricing Section */}
          <div className="pricing-section">
            <div className="container">
              <div className="section-header">
                <h2>Choose Your Plan</h2>
                <p className="section-description">Select the perfect plan to unlock your dream insights</p>
              </div>

              <div className="pricing-grid">
                {/* Free Tier */}
                <div className="pricing-card">
                  <div className="pricing-header">
                    <h3>Dream Explorer</h3>
                    <div className="price">
                      <span className="amount">Free</span>
                    </div>
                    <p className="pricing-description">Great for beginners</p>
                  </div>
                  <div className="pricing-features">
                    <ul>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Record up to 10 dreams per month
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Basic AI analysis of individual dreams
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Limited access to pattern recognition (last 30 days only)
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Web access only
                      </li>
                    </ul>
                  </div>
                  <div className="pricing-cta">
                    {isLoggedIn ? (
                      <Link to="/dreams" className="btn btn-outline">
                        Get Started
                      </Link>
                    ) : (
                      <button
                        onClick={login}
                        disabled={isAuthenticating}
                        className="btn btn-outline"
                      >
                        {isAuthenticating ? "Connecting..." : "Get Started"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Premium Tier */}
                <div className="pricing-card featured">
                  <div className="popular-badge">Most Popular</div>
                  <div className="pricing-header">
                    <h3>Dream Analyst</h3>
                    <div className="price">
                      <span className="amount">1 ICP</span>
                      <span className="period">/month</span>
                    </div>
                    <p className="pricing-description">Perfect for enthusiasts</p>
                  </div>
                  <div className="pricing-features">
                    <ul>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Unlimited dream recordings
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Advanced AI analysis with deeper insights
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Full pattern recognition across your entire dream history
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Export and sharing capabilities
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Priority support
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Web and mobile access
                      </li>
                    </ul>
                  </div>
                  <div className="pricing-cta">
                    {isLoggedIn ? (
                      <Link to="/upgrade" className="btn btn-primary">
                        Upgrade Now
                      </Link>
                    ) : (
                      <button
                        onClick={login}
                        disabled={isAuthenticating}
                        className="btn btn-primary"
                      >
                        {isAuthenticating ? "Connecting..." : "Sign Up"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Professional Tier */}
                <div className="pricing-card">
                  <div className="pricing-header">
                    <h3>Dream Master</h3>
                    <div className="price">
                      <span className="amount">3 ICP</span>
                      <span className="period">/month</span>
                    </div>
                    <p className="pricing-description">For serious dream explorers</p>
                  </div>
                  <div className="pricing-features">
                    <ul>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Everything in Premium
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Advanced pattern correlation with waking life events
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Custom symbol dictionary for personalized interpretations
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Weekly/monthly summary reports with actionable insights
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Group/family dream sharing (up to 5 accounts)
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        One-on-one consultation with dream analysis experts (1 session/month)
                      </li>
                      <li>
                        <i className="fas fa-check feature-icon"></i>
                        Early access to new features
                      </li>
                    </ul>
                  </div>
                  <div className="pricing-cta">
                    {isLoggedIn ? (
                      <Link to="/upgrade-pro" className="btn btn-outline">
                        Go Pro
                      </Link>
                    ) : (
                      <button
                        onClick={login}
                        disabled={isAuthenticating}
                        className="btn btn-outline"
                      >
                        {isAuthenticating ? "Connecting..." : "Get Started"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pricing-guarantee">
                <i className="fas fa-shield-alt guarantee-icon"></i>
                <p>All plans include secure storage on the Internet Computer blockchain and private data protection</p>
              </div>
            </div>
          </div>
          
          <div className="cta-section">
            <div className="container">
              <h2>Ready to Decode Your Dreams?</h2>
              <p>Join our community of dreamers and gain insights into your subconscious mind</p>
              {!isLoggedIn && (
                <button 
                  onClick={login} 
                  disabled={isAuthenticating}
                  className="btn btn-cta"
                >
                  <i className="fas fa-sign-in-alt btn-icon"></i>
                  {isAuthenticating ? "Connecting..." : "Get Started Now"}
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Footer */}
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
    </>
  );
};

export default LandingPage;