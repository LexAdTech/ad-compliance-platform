// Файл: ./repository/ArticleRepository.java
package com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    // Старые методы (оставляем для обратной совместимости)
    Article findById(long id);
    Article findByTitle(String title);

    // Новые методы
    List<Article> findByTitleContainingIgnoreCase(String keyword);

    @Query("SELECT a FROM Article a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.text) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Article> findByTitleOrTextContaining(@Param("keyword") String keyword);
}