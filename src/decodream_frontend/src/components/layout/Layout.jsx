import React, { useState } from "react";
import "../styles/LoadingOverlay.scss";
import Header from "./Header";
import Footer from "./Footer";
import ConfirmDialog from "../common/ConfirmDialog";
import Loading from "../common/Loading";
import { useDreams } from "../../context/DreamContext";

const Layout = ({ children }) => {
  const { dreamToDelete, clearDreamToDelete, deleteDreamEntry } = useDreams();
  const [isDeletingDream, setIsDeletingDream] = useState(false);

  return (
    <>
      <Header />
      {children}
      <Footer />

      {dreamToDelete && (
        <ConfirmDialog
          title="Confirm Deletion"
          message="Are you sure you want to delete this dream entry? This action cannot be undone."
          onConfirm={() => {
            setIsDeletingDream(true);
            deleteDreamEntry(dreamToDelete.timestamp)
              .finally(() => {
                clearDreamToDelete();
                setIsDeletingDream(false);
              });
          }}
          onCancel={clearDreamToDelete}
        />
      )}
      
      {isDeletingDream && (
        <div className="loading-overlay">
          <div className="loading-container">
            <Loading message="Deleting dream entry..." />
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;