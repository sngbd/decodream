import React, { createContext, useContext, useState, useEffect } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { identity, login, clear, isAuthenticating } = useInternetIdentity();
  const [anonymousAnalysisDone, setAnonymousAnalysisDone] = useState(false);

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

  const value = {
    identity,
    login,
    logout: clear,
    isAuthenticating,
    anonymousAnalysisDone,
    markAnonymousAnalysisDone,
    isLoggedIn: !!identity,
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