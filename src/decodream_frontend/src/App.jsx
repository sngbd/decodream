import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { DreamProvider } from "./context/DreamContext";
import Layout from "./components/layout/Layout";
import DreamForm from "./components/dream/DreamForm";
import DreamAnalysis from "./components/dream/DreamAnalysis";
import DreamEntryList from "./components/dream/DreamEntryList";

const App = () => {
  return (
    <AuthProvider>
      <DreamProvider>
        <Layout>
          <DreamForm />
          <DreamAnalysis />
          <DreamEntryList />
        </Layout>
      </DreamProvider>
    </AuthProvider>
  );
};

export default App;