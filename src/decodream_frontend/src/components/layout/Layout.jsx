import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <main>{children}</main>
      <footer>
        <p>Decodream - Powered by Internet Computer</p>
        <p>© {new Date().getFullYear()} Decodream</p>
      </footer>
    </div>
  );
};

export default Layout;