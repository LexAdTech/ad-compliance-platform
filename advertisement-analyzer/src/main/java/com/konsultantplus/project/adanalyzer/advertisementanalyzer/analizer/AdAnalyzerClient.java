package com.konsultantplus.project.adanalyzer.advertisementanalyzer.analizer;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class AdAnalyzerClient {
    private static final String API_URL = "http://localhost:8001/analyze";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AdAnalyzerClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public String analyzeAdText(String adText) {
        try {
            AnalysisRequest request = new AnalysisRequest(adText);
            String requestBody = objectMapper.writeValueAsString(request);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    httpRequest,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() == 200) {
                AnalysisResponse analysisResponse = objectMapper.readValue(
                        response.body(),
                        AnalysisResponse.class
                );

                if (analysisResponse.getError() != null) {
                    return "Ошибка анализа: " + analysisResponse.getError();
                }

                return analysisResponse.getAnalysis();
            } else {
                return "HTTP ошибка: " + response.statusCode();
            }

        } catch (Exception e) {
            return "Ошибка при отправке запроса: " + e.getMessage();
        }
    }
}