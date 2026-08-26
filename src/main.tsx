import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

const THEME_KEY = 'lasdoscaras_theme';

const applyTheme = () => {
  const saved =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(THEME_KEY)
      : null;
  const isDark = saved !== 'light';
  document.documentElement.classList.toggle('dark', isDark);
};

applyTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
