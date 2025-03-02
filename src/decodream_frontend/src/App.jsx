import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DreamProvider } from "./context/DreamContext";
import DreamForm from "./components/dream/DreamForm";
import DreamAnalysis from "./components/dream/DreamAnalysis";
import DreamEntryList from "./components/dream/DreamEntryList";
import LandingPage from "./components/layout/LandingPage";
import Layout from "./components/layout/Layout";
import SharedDreamView from "./components/dream/SharedDreamView";
import DreamNFTGallery from "./components/dream/DreamNFTGallery";
import DreamsPage from "./components/dream/DreamsPage";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <DreamProvider>
          <Layout>
            <Routes>
              <Route 
                path="/dreams" 
                element={
                  <>
                    <DreamsPage />
                  </>
                } 
              />
              <Route
                path="/shared/:shareId"
                element={
                  <SharedDreamView />
                }
              />
              <Route
                path="/nft-gallery"
                element={
                  <DreamNFTGallery />
                }
              />
              <Route
                path="/"
                element={
                  <LandingPage />
                } 
              />
              <Route
                path="*"
                element={
                  <Navigate to="/" replace />
                } 
              />
            </Routes>
          </Layout>
        </DreamProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;