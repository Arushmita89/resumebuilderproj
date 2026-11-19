package com.resumebuilder.analysis;

import com.resumebuilder.resume.ProjectItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Projects section: presence of entries, supporting detail, stack and proof links.
 */
@Component
public class ProjectsRule implements AnalysisRule {

    private static final int MAX_POINTS = 15;
    private static final int MIN_DESCRIPTION_LENGTH = 80;

    @Override
    public String name() {
        return "Projects";
    }

    @Override
    public String key() {
        return "projects";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public AnalysisDtos.SectionReport evaluate(AnalysisContext context) {
        List<ProjectItem> entries = context.projects();
        int score = 0;
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (entries.isEmpty()) {
            issues.add("No projects added");
            suggestions.add("Add at least 2 academic or personal projects — this is the strongest section for students.");
            return RuleSupport.report(this, context, score, false, issues, suggestions);
        }

        score += 2;

        boolean allDescribed = entries.stream()
                .allMatch(item -> RuleSupport.hasText(item.getName()) && RuleSupport.hasText(item.getDescription()));
        if (allDescribed) {
            score += 3;
        } else {
            issues.add("Some projects are missing a name or description");
            suggestions.add("Give every project a name and 2-3 lines describing the problem and your solution.");
        }

        boolean anyTech = entries.stream().anyMatch(item -> RuleSupport.hasText(item.getTech()));
        if (anyTech) {
            score += 3;
        } else {
            issues.add("Project technologies are not listed");
            suggestions.add("List the technologies used for each project, for example React, Node.js, PostgreSQL.");
        }

        boolean anyLink = entries.stream().anyMatch(item -> RuleSupport.hasText(item.getLink()));
        if (anyLink) {
            score += 2;
        } else {
            issues.add("No project links provided");
            suggestions.add("Link your GitHub repository or deployed demo for each project.");
        }

        boolean anySubstantial = entries.stream()
                .anyMatch(item -> item.getDescription() != null
                        && item.getDescription().length() >= MIN_DESCRIPTION_LENGTH);
        if (anySubstantial) {
            score += 2;
        } else {
            issues.add("Project descriptions are very short");
            suggestions.add("Expand descriptions to at least " + MIN_DESCRIPTION_LENGTH
                    + " characters including what you built and the outcome.");
        }

        long quantified = entries.stream()
                .filter(item -> RuleSupport.isQuantified(item.getDescription())).count();
        if (quantified >= 1) {
            score += 3;
        } else {
            issues.add("Few quantified achievements in projects");
            suggestions.add("Add measurable details such as number of users, records processed or percentage gains.");
        }

        return RuleSupport.report(this, context, score, true, issues, suggestions);
    }
}