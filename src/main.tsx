import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SetupNotice } from './components/SetupNotice';
import { isFirebaseConfigured } from './lib/firebase';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

if (!isFirebaseConfigured) {
  root.render(
    <React.StrictMode>
      <SetupNotice />
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
