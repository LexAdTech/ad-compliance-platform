package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.analizer.AdAnalyzerClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/analyze")
@Tag(name = "Анализ рекламы", description = "API для анализа рекламных текстов")
public class AnalysisController {

    private final AdAnalyzerClient adAnalyzerClient;

    public AnalysisController() {
        this.adAnalyzerClient = new AdAnalyzerClient();
    }

    @Operation(summary = "Анализ рекламного текста", description = "Отправляет рекламный текст на анализ и возвращает результат")
    @PostMapping
    public ResponseEntity<?> analyzeAdvertisement(@RequestBody Map<String, String> request, Principal principal) {
        try {
            String adText = request.get("text");
            String reportType = request.get("report_type");

            // Определяем тип отчета на основе авторизации
            if (reportType == null) {
                reportType = (principal != null) ? "full" : "short";
            }

            String result = adAnalyzerClient.analyzeAdText(adText, reportType);
            return ResponseEntity.ok().body(Map.of("analysis", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка анализа: " + e.getMessage()));
        }
    }
}