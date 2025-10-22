package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Article;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/articles")
@CrossOrigin(origins = "http://localhost:3001")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @GetMapping("/")
    public List<Article> getAllArticles() {
        return articleService.getAllArticles();
    }

    @GetMapping("/{id}")
    public Article getArticleById(@PathVariable(name = "id") long id) {
        return articleService.getArticleById(id);
    }

}
