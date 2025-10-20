package com.konsultantplus.project.adanalyzer.advertisementanalyzer.analizer;

public class AnalysisRequest {
    private String text;
    private String report_type;

    public AnalysisRequest(String text, String reportType) {
        this.text = text;
        this.report_type = reportType;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getReport_type() {
        return report_type;
    }

    public void setReport_type(String report_type) {
        this.report_type = report_type;
    }
}