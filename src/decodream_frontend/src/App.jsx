import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DreamProvider } from "./context/DreamContext";
import DreamForm from "./components/dream/DreamForm";
import DreamAnalysis from "./components/dream/DreamAnalysis";
import DreamEntryList from "./components/dream/DreamEntryList";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./components/landing/LandingPage";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <DreamProvider>
          <div className="app-container">
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route 
                  path="/dreams" 
                  element={
                    <ProtectedRoute>
                      <div className="dream-container">
                        <h1 className="sr-only">Dream Journal</h1>
                        <div className="dream-interface">
                          <DreamForm />
                          <DreamAnalysis />
                        </div>
                        <DreamEntryList />
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </DreamProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;