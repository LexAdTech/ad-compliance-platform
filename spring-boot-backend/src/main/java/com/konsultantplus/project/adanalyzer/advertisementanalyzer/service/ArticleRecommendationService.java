// Файл: ./service/ArticleRecommendationService.java
package com.konsultantplus.project.adanalyzer.advertisementanalyzer.service;

import com.konsultantplus.project.adanalyzer.advertisementanalyzer.entity.Article;
import com.konsultantplus.project.adanalyzer.advertisementanalyzer.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ArticleRecommendationService {

    @Autowired
    private ArticleRepository articleRepository;

    // Стоп-слова для русского языка
    private static final Set<String> STOP_WORDS = Set.of(
            "и", "в", "во", "не", "что", "он", "на", "я", "с", "со", "как", "а", "то",
            "все", "она", "так", "его", "но", "да", "ты", "к", "у", "же", "вы", "за",
            "бы", "по", "только", "ее", "мне", "было", "вот", "от", "меня", "еще", "нет",
            "о", "из", "ему", "теперь", "когда", "даже", "ну", "ли", "если", "уже", "или",
            "ни", "быть", "был", "него", "до", "вас", "нибудь", "уж", "вам", "сказал",
            "потом", "себя", "ничего", "ей", "может", "они", "тут", "где", "есть",
            "надо", "ней", "для", "мы", "тебя", "их", "чем", "была", "сам", "чтоб", "без",
            "будто", "чего", "раз", "тоже", "себе", "под", "будет", "ж", "тогда", "кто",
            "этот", "того", "потому", "этого", "какой", "совсем", "ним", "здесь", "этом",
            "один", "почти", "мой", "тем", "чтобы", "нее", "сейчас", "были", "куда", "зачем",
            "всех", "никогда", "можно", "при", "наконец", "два", "об", "другой", "хоть",
            "после", "над", "больше", "тот", "через", "эти", "нас", "про", "всего", "них",
            "какая", "много", "разве", "три", "эту", "моя", "впрочем", "хорошо", "свою",
            "этой", "перед", "иногда", "лучше", "чуть", "том", "нельзя", "такой", "им",
            "более", "всегда", "конечно", "всю", "между"
    );

    public List<Article> getRecommendedArticles(String adText, int limit) {
        System.out.println("=== 🔍 [RECOMMENDATION SERVICE START] ===");
        System.out.println("📝 Input text: " + (adText != null ? adText.substring(0, Math.min(adText.length(), 200)) : "NULL"));

        if (adText == null || adText.trim().isEmpty()) {
            System.out.println("❌ Text is empty or null");
            return Collections.emptyList();
        }

        List<Article> allArticles = articleRepository.findAll();
        System.out.println("📚 Total articles in database: " + allArticles.size());

        if (allArticles.isEmpty()) {
            System.out.println("❌ No articles found in database");
            return Collections.emptyList();
        }

        // Выводим информацию о статьях для отладки
        System.out.println("📖 Articles in database:");
        allArticles.forEach(article ->
                System.out.println("   - ID: " + article.getId() + ", Title: " + article.getTitle())
        );

        // Препроцессинг рекламного текста
        System.out.println("🔄 Starting text preprocessing...");
        Map<String, Double> adTfIdf = computeTfIdfForText(adText, allArticles);
        System.out.println("✅ Preprocessing completed. TF-IDF vector size: " + adTfIdf.size());
        System.out.println("🔑 TF-IDF vector: " + adTfIdf);

        // Вычисляем сходство для каждой статьи
        System.out.println("🎯 Calculating cosine similarity for each article...");
        List<ArticleScore> scoredArticles = allArticles.stream()
                .map(article -> {
                    double similarity = computeCosineSimilarity(adTfIdf, article);
                    System.out.println("   - Article '" + article.getTitle() + "': similarity = " + similarity);
                    return new ArticleScore(article, similarity);
                })
                .filter(score -> {
                    boolean passesFilter = score.similarity > 0.1;
                    System.out.println("   📊 Filter: '" + score.article.getTitle() + "' similarity " + score.similarity +
                            " > 0.1 = " + passesFilter);
                    return passesFilter;
                })
                .sorted((a, b) -> Double.compare(b.similarity, a.similarity))
                .limit(limit)
                .collect(Collectors.toList());

        System.out.println("✅ Articles after filtering: " + scoredArticles.size());

        List<Article> result = scoredArticles.stream()
                .map(score -> score.article)
                .collect(Collectors.toList());

        System.out.println("🎁 Final result: " + result.size() + " articles");
        if (!result.isEmpty()) {
            result.forEach(article -> System.out.println("   ✅ " + article.getTitle()));
        }
        System.out.println("=== 🔍 [RECOMMENDATION SERVICE END] ===\n");

        return result;
    }

    private Map<String, Double> computeTfIdfForText(String text, List<Article> allArticles) {
        System.out.println("   🔧 Computing TF-IDF for text...");
        List<String> tokens = preprocessText(text);
        System.out.println("   🔑 Tokens after preprocessing: " + tokens);

        Map<String, Double> tf = computeTermFrequency(tokens);
        System.out.println("   📊 Term Frequency: " + tf);

        Map<String, Double> tfidf = new HashMap<>();

        for (Map.Entry<String, Double> entry : tf.entrySet()) {
            String term = entry.getKey();
            double idf = computeInverseDocumentFrequency(term, allArticles);
            System.out.println("   📈 Term '" + term + "': TF=" + entry.getValue() + ", IDF=" + idf);
            tfidf.put(term, entry.getValue() * idf);
        }

        return tfidf;
    }

    private double computeCosineSimilarity(Map<String, Double> adVector, Article article) {
        System.out.println("   📐 Computing cosine similarity for: " + article.getTitle());

        Map<String, Double> articleVector = computeTfIdfForText(
                article.getTitle() + " " + article.getText(),
                Collections.singletonList(article)
        );

        System.out.println("   🔑 Article vector size: " + articleVector.size());
        System.out.println("   🔑 Ad vector size: " + adVector.size());

        if (adVector.isEmpty() || articleVector.isEmpty()) {
            System.out.println("   ❌ Empty vectors, similarity = 0");
            return 0.0;
        }

        // Вычисляем dot product
        double dotProduct = 0.0;
        for (Map.Entry<String, Double> entry : adVector.entrySet()) {
            String term = entry.getKey();
            if (articleVector.containsKey(term)) {
                double product = entry.getValue() * articleVector.get(term);
                dotProduct += product;
                System.out.println("   ➕ Term '" + term + "': " + entry.getValue() + " * " +
                        articleVector.get(term) + " = " + product + " (dotProduct = " + dotProduct + ")");
            }
        }

        // Вычисляем нормы векторов
        double adNorm = computeVectorNorm(adVector);
        double articleNorm = computeVectorNorm(articleVector);

        System.out.println("   📏 Ad vector norm: " + adNorm);
        System.out.println("   📏 Article vector norm: " + articleNorm);

        if (adNorm == 0 || articleNorm == 0) {
            System.out.println("   ❌ Zero norm, similarity = 0");
            return 0.0;
        }

        double similarity = dotProduct / (adNorm * articleNorm);
        System.out.println("   🎯 Final similarity: " + dotProduct + " / (" + adNorm + " * " + articleNorm + ") = " + similarity);

        return similarity;
    }

    private double computeVectorNorm(Map<String, Double> vector) {
        double sum = 0.0;
        for (double value : vector.values()) {
            sum += value * value;
        }
        double norm = Math.sqrt(sum);
        System.out.println("   📏 Vector norm: sqrt(" + sum + ") = " + norm);
        return norm;
    }

    private Map<String, Double> computeTermFrequency(List<String> tokens) {
        System.out.println("   📊 Computing term frequency for " + tokens.size() + " tokens");
        Map<String, Integer> freq = new HashMap<>();
        for (String token : tokens) {
            freq.put(token, freq.getOrDefault(token, 0) + 1);
        }

        Map<String, Double> tf = new HashMap<>();
        int totalTerms = tokens.size();
        for (Map.Entry<String, Integer> entry : freq.entrySet()) {
            tf.put(entry.getKey(), (double) entry.getValue() / totalTerms);
        }
        return tf;
    }

    private double computeInverseDocumentFrequency(String term, List<Article> allArticles) {
        if (term == null || term.trim().isEmpty()) {
            return 0;
        }

        long docsWithTerm = allArticles.stream()
                .filter(article -> containsTerm(article, term))
                .count();

        System.out.println("   📈 IDF for '" + term + "': " + docsWithTerm + " documents contain term out of " + allArticles.size());

        if (docsWithTerm == 0) {
            return 0;
        }

        double idf = Math.log((double) allArticles.size() / docsWithTerm) + 1.0; // +1 чтобы избежать нулей
        System.out.println("   ✅ IDF for '" + term + "': log(" + allArticles.size() + " / " + docsWithTerm + ") + 1 = " + idf);
        return idf;
    }

    private boolean containsTerm(Article article, String term) {
        String content = (article.getTitle() + " " + article.getText()).toLowerCase();
        boolean contains = content.contains(term.toLowerCase());
        System.out.println("   🔍 Article '" + article.getTitle() + "' contains '" + term + "': " + contains);
        return contains;
    }

    private List<String> preprocessText(String text) {
        System.out.println("   🧹 Preprocessing text: " + (text != null ? text.substring(0, Math.min(text.length(), 100)) : "NULL"));

        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }

        // Используем правильное разбиение для русского текста
        List<String> tokens = Arrays.stream(text.toLowerCase().split("[^\\p{L}]+"))
                .filter(token -> {
                    boolean lengthOk = token.length() > 1; // Уменьшаем минимальную длину
                    boolean notStopWord = !STOP_WORDS.contains(token);
                    // Убираем проверку на цифры для русских слов
                    boolean isRussianWord = token.matches("[а-яё]+");

                    if (!lengthOk) {
                        System.out.println("     ❌ Token '" + token + "' filtered out: too short");
                    } else if (!notStopWord) {
                        System.out.println("     ❌ Token '" + token + "' filtered out: stop word");
                    } else if (!isRussianWord) {
                        System.out.println("     ❌ Token '" + token + "' filtered out: not Russian word");
                    } else {
                        System.out.println("     ✅ Token '" + token + "' kept");
                    }

                    return lengthOk && notStopWord && isRussianWord;
                })
                .collect(Collectors.toList());

        System.out.println("   ✅ Preprocessing complete. Tokens: " + tokens);
        return tokens;
    }

    // Вспомогательный класс для хранения статьи и её оценки
    private static class ArticleScore {
        Article article;
        double similarity;

        ArticleScore(Article article, double similarity) {
            this.article = article;
            this.similarity = similarity;
        }
    }
}