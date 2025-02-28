import React, { useState } from "react";
import "../styles/LoadingOverlay.scss";
import Header from "./Header";
import ConfirmDialog from "../common/ConfirmDialog";
import Loading from "../common/Loading";
import { useDreams } from "../../context/DreamContext";

const Layout = ({ children }) => {
  const { dreamToDelete, clearDreamToDelete, deleteDreamEntry } = useDreams();
  const [isDeletingDream, setIsDeletingDream] = useState(false);

  return (
    <div className="app-container">
      <Header />
      <main>{children}</main>
      <footer>
        <p>Decodream - Powered by Internet Computer</p>
        <p>© {new Date().getFullYear()} Decodream</p>
      </footer>

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
    </div>
  );
};

export default Layout;