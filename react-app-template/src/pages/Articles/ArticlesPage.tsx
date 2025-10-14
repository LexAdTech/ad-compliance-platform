import React from 'react';
import { Header } from '../../components/Header/Header';
import  ArticleText  from '../../components/Common/ArticleText';
import styles from './ArticlesPage.module.css';

interface ArticlesPageProps {
  onNavigateHome: () => void;
  onLoginClick: () => void;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({
  onNavigateHome,
  onLoginClick,
}) => {
  return (
    <div className={styles.container}>
      <Header 
        currentPage="articles"
        onNavigateHome={onNavigateHome}
        onNavigateArticles={() => {}} // Пустая функция, так как уже на статьях
        onLoginClick={onLoginClick}
      />
      
      <main className={styles.main}>
        <ArticleText />
      </main>
    </div>
  );
};