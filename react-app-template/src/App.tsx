import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { AccessDeniedModal } from './components/Auth/AccessDeniedModal';
import { HomePage } from './pages/Home/HomePage';
import { ArticlesPage } from './pages/Articles/ArticlesPage';
import { AuthMode } from './types';
import './App.module.css';

function AppContent() {
  const [showArticles, setShowArticles] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accessDeniedModalOpen, setAccessDeniedModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>('login');
  
  const { isLoggedIn } = useAuthContext();

  const handleLoginSuccess = () => {
    setAuthModalOpen(false);
  };

  const handleLoginClick = () => {
    setAuthModalOpen(true);
    setModalMode('login');
  };

  const handleNavigateToArticles = () => {
    if (isLoggedIn) {
      setShowArticles(true);
    } else {
      setAccessDeniedModalOpen(true);
    }
  };

  const handleNavigateToHome = () => {
    setShowArticles(false);
  };

  const handleAccessDeniedRegister = () => {
    setAccessDeniedModalOpen(false);
    setAuthModalOpen(true);
    setModalMode('register');
  };

  const handleAccessDeniedLogin = () => {
    setAccessDeniedModalOpen(false);
    setAuthModalOpen(true);
    setModalMode('login');
  };

  const handleAccessDeniedClose = () => {
    setAccessDeniedModalOpen(false);
  };

  return (
    <div className="app">
      {showArticles ? (
        <ArticlesPage 
          onNavigateHome={handleNavigateToHome}
          onLoginClick={handleLoginClick}
        />
      ) : (
        <HomePage 
          onNavigateArticles={handleNavigateToArticles}
          onLoginClick={handleLoginClick}
        />
      )}

      {authModalOpen && (
        <AuthModal
          mode={modalMode}
          setMode={setModalMode}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {accessDeniedModalOpen && (
        <AccessDeniedModal
          onClose={handleAccessDeniedClose}
          onRegister={handleAccessDeniedRegister}
          onLogin={handleAccessDeniedLogin}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}