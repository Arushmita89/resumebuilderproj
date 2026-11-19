package com.resumebuilder.analysis;

import com.resumebuilder.resume.EducationItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Education completeness: institution, degree, dates and supporting detail.
 */
@Component
public class EducationRule implements AnalysisRule {

    private static final int MAX_POINTS = 10;

    @Override
    public String name() {
        return "Education";
    }

    @Override
    public String key() {
        return "education";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public AnalysisDtos.SectionReport evaluate(AnalysisContext context) {
        List<EducationItem> entries = context.education();
        int score = 0;
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (entries.isEmpty()) {
            issues.add("No education entries added");
            suggestions.add("Add at least one education entry with your degree and institution.");
            return RuleSupport.report(this, context, score, false, issues, suggestions);
        }

        for (EducationItem item : entries) {
            if (RuleSupport.hasText(item.getSchool())) {
                score += 2;
            } else {
                issues.add("An education entry has no institution name");
                suggestions.add("Add the school or university name for every education entry.");
            }

            if (RuleSupport.hasText(item.getDegree()) || RuleSupport.hasText(item.getField())) {
                score += 2;
            } else {
                issues.add("Degree or field of study is missing");
                suggestions.add("Add your degree and field of study, for example B.Tech in Computer Science.");
            }
            break;
        }

        boolean allDated = entries.stream()
                .allMatch(item -> RuleSupport.hasText(item.getStartDate()) || RuleSupport.hasText(item.getEndDate()));
        if (allDated) {
            score += 2;
        } else {
            issues.add("Graduation dates are missing");
            suggestions.add("Add start and end dates to every education entry.");
        }

        boolean hasDetail = entries.stream()
                .anyMatch(item -> RuleSupport.hasText(item.getGpa()) || RuleSupport.hasText(item.getDescription()));
        if (hasDetail) {
            score += 2;
        } else {
            issues.add("No GPA, coursework or achievements listed");
            suggestions.add("Add your CGPA/GPA or a short line about relevant coursework or achievements.");
        }

        if (entries.size() > 1) {
            score += 2;
        } else {
            issues.add("Only one education entry listed");
            suggestions.add("Add your most recent qualification first, then previous ones below it.");
        }

        return RuleSupport.report(this, context, score, true, issues, suggestions);
    }
}