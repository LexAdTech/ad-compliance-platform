// Файл: ./controller/RecommendationController.java
package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Article;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.service.ArticleRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final ArticleRecommendationService recommendationService;

    @Autowired
    public RecommendationController(ArticleRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    public ResponseEntity<List<Article>> getArticleRecommendations(@RequestBody Map<String, String> request) {
        System.out.println("=== 🚀 [CONTROLLER] Recommendation Request ===");
        try {
            String adText = request.get("text");
            System.out.println("📨 Request text: " + adText);
            System.out.println("📨 Request body: " + request);

            List<Article> recommendations = recommendationService.getRecommendedArticles(adText, 3);
            System.out.println("📤 Sending response with " + recommendations.size() + " articles");
            System.out.println("=== 🚀 [CONTROLLER] Request Finished ===\n");

            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            System.err.println("❌ Error in controller: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
}