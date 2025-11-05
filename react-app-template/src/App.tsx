// App.tsx
import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { AccessDeniedModal } from './components/Auth/AccessDeniedModal';
import { HomePage } from './pages/Home/HomePage';
import { ArticlesPage } from './pages/Articles/ArticlesPage';
import { ContactPage } from './pages/Contact/ContactPage';
import { Footer } from './components/Footer/Footer';
import { AuthMode } from './types';
import './App.module.css';

type CurrentPage = 'home' | 'articles' | 'contact';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accessDeniedModalOpen, setAccessDeniedModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>('login');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  const { isLoggedIn } = useAuthContext();

  // Добавляем недостающую функцию handleArticleClick
  const handleArticleClick = (articleId: number) => {
    if (isLoggedIn) {
      // Если пользователь авторизован, переходим на страницу статей и открываем конкретную статью
      setSelectedArticleId(articleId);
      setCurrentPage('articles');
    } else {
      // Если не авторизован, показываем модальное окно доступа
      setAccessDeniedModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setAuthModalOpen(false);
  };

  const handleLoginClick = () => {
    setAuthModalOpen(true);
    setModalMode('login');
  };

  const handleNavigateToArticles = () => {
    if (isLoggedIn) {
      setCurrentPage('articles');
      setSelectedArticleId(null); // Сбрасываем выбранную статью при переходе к списку
    } else {
      setAccessDeniedModalOpen(true);
    }
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
    setSelectedArticleId(null); // Сбрасываем выбранную статью при переходе на главную
  };

  const handleNavigateToContact = () => {
    setCurrentPage('contact');
    setSelectedArticleId(null); // Сбрасываем выбранную статью при переходе в контакты
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

  // Функция для рендеринга текущей страницы
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'articles':
        return (
            <ArticlesPage
                onNavigateHome={handleNavigateToHome}
                onNavigateArticles={handleNavigateToArticles}
                onNavigateContact={handleNavigateToContact}
                onLoginClick={handleLoginClick}
                initialArticleId={selectedArticleId} // Передаем выбранную статью
            />
        );
      case 'contact':
        return (
            <ContactPage
                onNavigateHome={handleNavigateToHome}
                onNavigateArticles={handleNavigateToArticles}
                onNavigateContact={handleNavigateToContact}
                onLoginClick={handleLoginClick}
            />
        );
      case 'home':
      default:
        return (
            <HomePage
                onNavigateArticles={handleNavigateToArticles}
                onNavigateContact={handleNavigateToContact}
                onLoginClick={handleLoginClick}
                onArticleClick={handleArticleClick}
            />
        );
    }
  };

  return (
      <div className="app">
        <div className="app-content">
          {renderCurrentPage()}

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

        <Footer />
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