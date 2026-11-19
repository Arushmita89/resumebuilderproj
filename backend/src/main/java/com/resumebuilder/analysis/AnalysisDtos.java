package com.resumebuilder.analysis;

import java.time.LocalDateTime;
import java.util.List;

public record AnalysisDtos() {

    public record SectionReport(String key, String section, String status,
                                int score, int maxPoints,
                                List<String> issues, List<String> suggestions) {
    }

    public record KeywordHit(String keyword, boolean matched, int occurrences) {
    }

    public record KeywordReport(boolean jobDescriptionProvided, int matchedCount, int totalKeywords,
                                List<KeywordHit> keywords, List<String> matchedKeywords,
                                List<String> missingKeywords) {
    }

    public record FormattingIssue(String id, String label, String message, String severity) {
    }

    public record SummaryCards(int keywordMatched, int keywordTotal, int missingSections,
                               int formattingIssues, int strongSections, int totalSections) {
    }

    public record AnalyzeRequest(String jobTitle, String jobDescription) {
    }

    public record Report(Long resumeId, String resumeTitle, String targetJobTitle,
                         Integer overallScore, String verdict,
                         SummaryCards summary, List<SectionReport> sections,
                         KeywordReport keywords, List<FormattingIssue> formattingIssues,
                         List<String> overallTips, LocalDateTime analyzedAt) {
    }

    public record HistorySummary(Long id, Long resumeId, String resumeTitle, Integer overallScore,
                                 LocalDateTime createdAt) {
    }

    public record HistoryEntry(Long id, Long resumeId, String resumeTitle, Integer overallScore,
                               LocalDateTime createdAt, Report report) {
    }
}