package com.konsultantplus.project.adanalyzer.advertisementanalyzer.analizer;

public class AnalysisRequest {
    private String text;

    public AnalysisRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}