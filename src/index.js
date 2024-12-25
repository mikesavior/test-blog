import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import dotenv from 'dotenv';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Initialize dotenv
dotenv.config();

// Log environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    AWS_BUCKET_NAME: process.env.REACT_APP_AWS_BUCKET_NAME,
    AWS_REGION: process.env.REACT_APP_AWS_REGION
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
