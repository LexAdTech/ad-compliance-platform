package com.konsultantplus.project.adanalyzer.advertisementanalyzer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/analyze")
public class AudioAnalysisController {

    private static final String SPEECH_TO_TEXT_URL = "http://localhost:8003/speech-to-text";
    private static final String TEXT_ANALYZER_URL = "http://localhost:8001/analyze";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @PostMapping("/audio")
    public ResponseEntity<?> analyzeAudio(@RequestParam("audio") MultipartFile audioFile) {
        try {
            System.out.println("=== 🎵 [AUDIO ANALYSIS START] ===");
            System.out.println("📁 Audio file received: " + audioFile.getOriginalFilename());
            System.out.println("📊 File size: " + audioFile.getSize() + " bytes");

            // Шаг 1: Конвертация аудио в текст
            String recognizedText = convertAudioToText(audioFile);
            System.out.println("🎤 Recognized text: " + recognizedText);

            if (recognizedText == null || recognizedText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Не удалось распознать речь в аудиофайле"
                ));
            }

            // Шаг 2: Анализ распознанного текста
            String analysisResult = analyzeText(recognizedText);
            System.out.println("📝 Analysis result length: " + analysisResult.length());

            System.out.println("=== 🎵 [AUDIO ANALYSIS END] ===\n");

            return ResponseEntity.ok().body(Map.of(
                "converted_text", recognizedText,
                "analysis", analysisResult
            ));

        } catch (Exception e) {
            System.err.println("❌ Error in audio analysis: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Ошибка при обработке аудио: " + e.getMessage()
            ));
        }
    }

    private String convertAudioToText(MultipartFile audioFile) throws IOException, InterruptedException {
        System.out.println("🔄 Converting audio to text...");

        // Создаем временный файл для передачи в speech-to-text сервис
        java.nio.file.Path tempFile = java.nio.file.Files.createTempFile("audio_", ".tmp");
        audioFile.getBytes(); // Ensure we can read the file
        
        // Подготавливаем multipart/form-data запрос
        var boundary = "-------------" + System.currentTimeMillis();
        
        // Читаем файл в байтовый массив
        byte[] fileBytes = audioFile.getBytes();
        
        // Строим multipart запрос вручную
        var bodyBuilder = new StringBuilder();
        bodyBuilder.append("--").append(boundary).append("\r\n")
                  .append("Content-Disposition: form-data; name=\"audio_file\"; filename=\"")
                  .append(audioFile.getOriginalFilename()).append("\"\r\n")
                  .append("Content-Type: ").append(audioFile.getContentType()).append("\r\n\r\n");
        
        byte[] bodyStart = bodyBuilder.toString().getBytes();
        byte[] bodyEnd = ("\r\n--" + boundary + "--\r\n").getBytes();
        
        byte[] requestBody = new byte[bodyStart.length + fileBytes.length + bodyEnd.length];
        System.arraycopy(bodyStart, 0, requestBody, 0, bodyStart.length);
        System.arraycopy(fileBytes, 0, requestBody, bodyStart.length, fileBytes.length);
        System.arraycopy(bodyEnd, 0, requestBody, bodyStart.length + fileBytes.length, bodyEnd.length);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SPEECH_TO_TEXT_URL))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            // Парсим JSON ответ
            String responseBody = response.body();
            System.out.println("✅ Speech-to-text response: " + responseBody);
            
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var jsonNode = mapper.readTree(responseBody);
                return jsonNode.get("text").asText();
            } catch (Exception e) {
                System.err.println("❌ Error parsing speech-to-text response: " + e.getMessage());
                return null;
            }
        } else {
            System.err.println("❌ Speech-to-text service error: " + response.statusCode() + " - " + response.body());
            return null;
        }
    }

    private String analyzeText(String text) throws IOException, InterruptedException {
        System.out.println("🔄 Analyzing converted text...");

        // Подготавливаем запрос к текстовому анализатору
        var requestBody = "{\"text\": \"" + text.replace("\"", "\\\"") + "\", \"report_type\": \"short\"}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TEXT_ANALYZER_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var jsonNode = mapper.readTree(response.body());
                return jsonNode.get("analysis").asText();
            } catch (Exception e) {
                System.err.println("❌ Error parsing text analyzer response: " + e.getMessage());
                return "Ошибка при анализе текста";
            }
        } else {
            System.err.println("❌ Text analyzer service error: " + response.statusCode() + " - " + response.body());
            return "Сервис анализа текста недоступен";
        }
    }
}