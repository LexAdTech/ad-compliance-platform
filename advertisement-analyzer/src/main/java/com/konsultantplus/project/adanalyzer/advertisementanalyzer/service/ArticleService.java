// Файл: ./service/ArticleService.java
package com.konsultantplus.project.adanalyzer.advertisementanalyzer.service;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Article;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article getArticleById(Long id) {
        Optional<Article> article = articleRepository.findById(id);
        return article.orElse(null);
    }

    public Article saveArticle(Article article) {
        return articleRepository.save(article);
    }

    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }

    public List<Article> getArticlesByTitleContaining(String keyword) {
        return articleRepository.findByTitleContainingIgnoreCase(keyword);
    }
}