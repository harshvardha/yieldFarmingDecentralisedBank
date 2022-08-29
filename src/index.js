import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { YieldFarmingProvider } from './context/YieldFarmingContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <YieldFarmingProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </YieldFarmingProvider>
);
