package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.analizer.AdAnalyzerClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

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
    public String analyzeAdvertisement(@RequestBody String adText) {
        return adAnalyzerClient.analyzeAdText(adText);
    }
}



