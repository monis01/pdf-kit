// src/main.jsx - Application Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Bootstrap CSS (loaded before our custom styles)
import 'bootstrap/dist/css/bootstrap.min.css';

// Our custom styles (will override Bootstrap where needed)
import './styles/components.css';

// Create root and render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);