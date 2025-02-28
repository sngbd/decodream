// Update main.js to include router
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.scss';
import { InternetIdentityProvider } from "ic-use-internet-identity";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </React.StrictMode>,
);