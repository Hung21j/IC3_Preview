import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure dark mode is fully removed and cleared from any browser storage
try {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('ic3_ui_theme');
} catch {
  // ignore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

