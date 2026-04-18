import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './context/LanguageContext';
import { PHUProvider } from './context/PHUContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <PHUProvider>
        <App />
      </PHUProvider>
    </LanguageProvider>
  </StrictMode>
);
