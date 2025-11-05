// Файл: ./entity/Article.java
package com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "articles")
@Data
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "text")
    private String text;

    @Column(name = "created_at")
    private LocalDateTime created_at;

    // Геттеры (Lombok @Data уже создает их, но явно объявим если нужно)
    public String getTitle() {
        return title;
    }

    public String getText() {
        return text;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public Long getId() {
        return id;
    }
}