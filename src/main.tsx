import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SWRConfig value={{ shouldRetryOnError: false, revalidateOnFocus: true, dedupingInterval: 5000 }}>
        <App />
        <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' } }} />
      </SWRConfig>
    </ThemeProvider>
  </React.StrictMode>
);
