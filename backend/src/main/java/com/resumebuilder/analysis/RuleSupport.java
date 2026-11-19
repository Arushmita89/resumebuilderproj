package com.resumebuilder.analysis;

import java.util.List;
import java.util.Locale;

/**
 * Shared constants and small helpers used by the analysis rules.
 */
final class RuleSupport {

    static final List<String> STRONG_VERBS = List.of(
            "achieved", "architected", "automated", "built", "collaborated", "configured", "consolidated",
            "created", "debugged", "decreased", "delivered", "deployed", "designed", "developed",
            "diagnosed", "documented", "eliminated", "enabled", "engineered", "established", "evaluated",
            "executed", "expanded", "generated", "grew", "implemented", "improved", "increased",
            "integrated", "introduced", "launched", "led", "maintained", "managed", "mentored",
            "migrated", "modernized", "negotiated", "optimized", "orchestrated", "performed",
            "presented", "produced", "programmed", "published", "reduced", "refactored", "resolved",
            "restructured", "revamped", "scaled", "secured", "shipped", "simplified", "spearheaded",
            "streamlined", "tested", "trained", "transformed", "upgraded"
    );

    static final List<String> WEAK_PHRASES = List.of(
            "responsible for", "worked on", "worked with", "helped with", "helped on", "involved in",
            "assisted with", "participated in", "took part in", "dealt with", "in charge of",
            "tasks included", "duties included", "assigned to", "was a member", "part of the team",
            "involved in various", "did various"
    );

    static final int SUMMARY_MIN_LENGTH = 120;
    static final int SUMMARY_MAX_LENGTH = 500;
    static final int BULLET_MAX_LENGTH = 220;

    private RuleSupport() {
    }

    static List<String> text(String... values) {
        java.util.ArrayList<String> parts = new java.util.ArrayList<>();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                parts.add(value);
            }
        }
        return parts;
    }

    static String lower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    static boolean containsStrongVerb(String value) {
        String text = lower(value);
        for (String verb : STRONG_VERBS) {
            if (containsWord(text, verb)) {
                return true;
            }
        }
        return false;
    }

    static boolean containsWeakPhrase(String value) {
        String text = lower(value);
        for (String phrase : WEAK_PHRASES) {
            if (text.contains(phrase)) {
                return true;
            }
        }
        return false;
    }

    /** Quantified achievement: any digit run, so "cut build time 40%" or "handled 500+ tickets" counts. */
    static boolean isQuantified(String value) {
        return value != null && value.matches(".*\\d.*");
    }

    static int countMatchedKeywords(AnalysisContext context) {
        AnalysisDtos.KeywordReport report = context.keywords();
        if (report == null || !report.jobDescriptionProvided() || report.totalKeywords() == 0) {
            return 0;
        }
        return report.matchedCount();
    }

    static int keywordPoints(AnalysisContext context, int maxPoints) {
        AnalysisDtos.KeywordReport report = context.keywords();
        if (report == null || !report.jobDescriptionProvided() || report.totalKeywords() == 0) {
            return 0;
        }
        return (int) Math.round(((double) report.matchedCount() / report.totalKeywords()) * maxPoints);
    }

    static AnalysisDtos.SectionReport report(AnalysisRule rule, AnalysisContext context,
                                            int score, boolean sectionPresent,
                                            List<String> issues, List<String> suggestions) {
        int clamped = Math.max(0, Math.min(score, rule.maxPoints()));
        return new AnalysisDtos.SectionReport(rule.key(), rule.name(),
                SectionStatus.from(clamped, rule.maxPoints(), sectionPresent).name(),
                clamped, rule.maxPoints(), issues, suggestions);
    }

    private static boolean containsWord(String text, String word) {
        int index = text.indexOf(word);
        while (index >= 0) {
            boolean startOk = index == 0 || !Character.isLetterOrDigit(text.charAt(index - 1));
            int end = index + word.length();
            boolean endOk = end >= text.length() || !Character.isLetterOrDigit(text.charAt(end));
            if (startOk && endOk) {
                return true;
            }
            index = text.indexOf(word, index + 1);
        }
        return false;
    }
}