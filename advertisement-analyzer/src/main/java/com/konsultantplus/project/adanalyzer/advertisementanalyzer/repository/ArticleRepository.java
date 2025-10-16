package com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    Article findById(long id);
    Article findByTitle(String title);
}
