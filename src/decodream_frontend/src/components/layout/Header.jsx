import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { isLoggedIn, identity, login, logout, isAuthenticating } = useAuth();

  return (
    <header>
      <div>
        <h1>Decodream: Dream Analysis</h1>
        <p>
          Decode your dreams with AI on the Internet Computer
        </p>
      </div>
      
      {isLoggedIn ? (
        <div>
          <span>
            <strong>Principal ID:</strong> {identity.getPrincipal().toString().substring(0, 8)}...
          </span>
          <button 
            onClick={logout} 
            disabled={isAuthenticating}
          >
            {isAuthenticating ? "Processing..." : "Logout"}
          </button>
        </div>
      ) : (
        <button 
          onClick={login} 
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Connecting..." : "Login with Internet Identity"}
        </button>
      )}
    </header>
  );
};

export default Header;