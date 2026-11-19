package com.resumebuilder.analysis;

import com.resumebuilder.resume.Resume;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Aggregates every {@link AnalysisRule} into a single report. Deterministic: the same
 * resume and job description always produce the same score, issues and suggestions.
 */
@Component
public class ResumeAnalyzer {

    private static final int TIP_LIMIT = 6;

    /** Presentation order of the six sections, independent of bean registration order. */
    private static final List<String> SECTION_ORDER = List.of(
            "personal", "education", "experience", "skills", "projects", "formatting");

    private final List<AnalysisRule> rules;

    public ResumeAnalyzer(List<AnalysisRule> rules) {
        this.rules = rules.stream()
                .sorted(Comparator.comparingInt(rule -> {
                    int index = SECTION_ORDER.indexOf(rule.key());
                    return index == -1 ? SECTION_ORDER.size() : index;
                }))
                .toList();
    }

    public AnalysisDtos.Report analyze(Resume resume, String jobDescription, String jobTitle,
                                       AnalysisContext context) {
        List<AnalysisDtos.SectionReport> sections = new ArrayList<>();
        int totalScore = 0;
        int totalMax = 0;

        for (AnalysisRule rule : rules) {
            AnalysisDtos.SectionReport section = rule.evaluate(context);
            sections.add(section);
            totalScore += section.score();
            totalMax += section.maxPoints();
        }

        int overallScore = totalMax == 0 ? 0 : (int) Math.round((totalScore * 100.0) / totalMax);

        AnalysisDtos.KeywordReport keywords = context.keywords();
        List<AnalysisDtos.FormattingIssue> formattingIssues = context.formattingIssues();

        long missingSections = sections.stream()
                .filter(section -> SectionStatus.MISSING.name().equals(section.status()))
                .count();
        long strongSections = sections.stream()
                .filter(section -> SectionStatus.COMPLETE.name().equals(section.status()))
                .count();

        AnalysisDtos.SummaryCards summary = new AnalysisDtos.SummaryCards(
                keywords.matchedCount(),
                keywords.totalKeywords(),
                (int) missingSections,
                formattingIssues.size(),
                (int) strongSections,
                sections.size());

        return new AnalysisDtos.Report(
                resume.getId(),
                resume.getTitle(),
                jobTitle == null || jobTitle.isBlank() ? resume.getTargetJobTitle() : jobTitle,
                overallScore,
                verdictFor(overallScore),
                summary,
                sections,
                keywords,
                formattingIssues,
                overallTips(sections),
                LocalDateTime.now());
    }

    private String verdictFor(int score) {
        if (score >= 85) {
            return "Excellent — this resume is well prepared for ATS screening.";
        }
        if (score >= 70) {
            return "Good — a few improvements are recommended.";
        }
        if (score >= 50) {
            return "Fair — several sections need work before you apply.";
        }
        return "Poor — this resume is not ready for applications yet.";
    }

    private List<String> overallTips(List<AnalysisDtos.SectionReport> sections) {
        return sections.stream()
                .filter(section -> !SectionStatus.COMPLETE.name().equals(section.status()))
                .sorted(Comparator.comparingInt(section -> statusRank(section.status())))
                .flatMap(section -> section.suggestions().stream())
                .distinct()
                .limit(TIP_LIMIT)
                .toList();
    }

    private int statusRank(String status) {
        return switch (status) {
            case "MISSING" -> 0;
            case "NEEDS_IMPROVEMENT" -> 1;
            case "GOOD" -> 2;
            default -> 3;
        };
    }
}