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

    public Article getArticleById(long id) {
        return articleRepository.findById(id);
    }
}
