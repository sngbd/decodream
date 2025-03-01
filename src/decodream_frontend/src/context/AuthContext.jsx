import React, { createContext, useContext, useState, useEffect } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { identity, login, clear, isAuthenticating } = useInternetIdentity();
  const [anonymousAnalysisDone, setAnonymousAnalysisDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const anonAnalysisDone = localStorage.getItem("anonymousAnalysisDone");
    if (anonAnalysisDone === "true") {
      setAnonymousAnalysisDone(true);
    }
  }, []);

  const markAnonymousAnalysisDone = () => {
    setAnonymousAnalysisDone(true);
    localStorage.setItem("anonymousAnalysisDone", "true");
  };

  const logout = () => {
    if (isAuthenticating) return;
    clear();
    navigate('/');
  };

  const value = {
    identity,
    login,
    logout,
    isAuthenticating,
    anonymousAnalysisDone,
    markAnonymousAnalysisDone,
    isLoggedIn: !!identity,
    isAuthenticated: !!identity,
    getPrincipal: () => identity?.getPrincipal().toString(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};