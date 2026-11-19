package com.resumebuilder.analysis;

import com.resumebuilder.resume.ExperienceItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Experience quality: presence of roles, complete role details, bullet structure,
 * action verbs, quantified achievements and job-description keyword coverage.
 *
 * <p>Points (max 20): 2 entries present, 2 title and company, 2 dates, 2 bullets per role,
 * 4 action verbs, 2 quantified results, 2 no filler phrases, 4 keyword coverage.
 * Without a job description the keyword slot awards a neutral 2-point baseline so the section
 * can still reach COMPLETE.
 */
@Component
public class ExperienceRule implements AnalysisRule {

    private static final int MAX_POINTS = 20;
    private static final int NO_JOB_DESCRIPTION_BASELINE = 2;

    @Override
    public String name() {
        return "Experience";
    }

    @Override
    public String key() {
        return "experience";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public AnalysisDtos.SectionReport evaluate(AnalysisContext context) {
        List<ExperienceItem> entries = context.experience();
        int score = 0;
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (entries.isEmpty()) {
            issues.add("No work experience or internships added");
            suggestions.add("Add internships, part-time work or volunteer roles — anything with responsibilities counts.");
            suggestions.add("If you have no experience yet, add strong project entries under Projects instead.");
            return RuleSupport.report(this, context, score, false, issues, suggestions);
        }

        score += 2;

        boolean allTitled = entries.stream()
                .allMatch(item -> RuleSupport.hasText(item.getTitle()) && RuleSupport.hasText(item.getCompany()));
        if (allTitled) {
            score += 2;
        } else {
            issues.add("Some entries are missing a job title or company name");
            suggestions.add("Give every experience entry a role title and the company or organisation name.");
        }

        boolean allDated = entries.stream().allMatch(item -> RuleSupport.hasText(item.getStartDate()));
        if (allDated) {
            score += 2;
        } else {
            issues.add("Some entries are missing a start date");
            suggestions.add("Add a start date to every role, and an end date unless you are still working there.");
        }

        List<String> allBullets = new ArrayList<>();
        boolean everyRoleHasBullets = true;
        for (ExperienceItem item : entries) {
            List<String> bullets = item.getBullets() == null ? List.of() : item.getBullets();
            allBullets.addAll(bullets);
            if (bullets.size() < 3) {
                everyRoleHasBullets = false;
            }
        }

        if (everyRoleHasBullets) {
            score += 2;
        } else if (allBullets.size() >= 3) {
            issues.add("Some roles have fewer than 3 bullet points");
            suggestions.add("Give each role at least 3 bullet points — one achievement per line.");
        } else {
            issues.add("Fewer than 3 achievement bullets across all experience entries");
            suggestions.add("Write at least 3 bullet points per role describing what you did.");
        }

        long strongCount = allBullets.stream().filter(RuleSupport::containsStrongVerb).count();
        boolean hasWeakPhrase = allBullets.stream().anyMatch(RuleSupport::containsWeakPhrase);
        if (allBullets.isEmpty()) {
            issues.add("Experience entries have no bullet points");
            suggestions.add("Add bullet points — one achievement per line.");
        } else {
            double strongRatio = (double) strongCount / allBullets.size();
            if (strongRatio >= 0.5) {
                score += 4;
            } else {
                if (strongRatio >= 0.25) {
                    score += 2;
                }
                issues.add("Description contains weak action verbs");
                suggestions.add("Use stronger action verbs such as developed, built, optimised or led.");
            }
            if (hasWeakPhrase) {
                issues.add("Bullets use filler phrases such as \"responsible for\" or \"worked on\"");
                suggestions.add("Replace \"responsible for\" and \"worked on\" with the action you actually performed.");
            }
        }

        long quantified = allBullets.stream().filter(RuleSupport::isQuantified).count();
        if (quantified >= 2) {
            score += 2;
        } else if (quantified == 1) {
            score += 1;
            issues.add("Few quantified achievements");
            suggestions.add("Add measurable results where possible, for example reduced build time by 40%.");
        } else {
            issues.add("Few quantified achievements");
            suggestions.add("Add measurable results where possible, for example reduced build time by 40%.");
        }

        if (!hasWeakPhrase) {
            score += 2;
        }

        if (context.keywords().jobDescriptionProvided()) {
            score += RuleSupport.keywordPoints(context, 4);
            List<String> missing = context.keywords().missingKeywords();
            if (!missing.isEmpty()) {
                issues.add("Some job-relevant keywords are missing from your experience bullets");
                suggestions.add("Work relevant technologies from the job description into your bullets, such as "
                        + String.join(", ", missing.subList(0, Math.min(3, missing.size()))) + ".");
            }
        } else {
            score += NO_JOB_DESCRIPTION_BASELINE;
            suggestions.add("Analyze against a job description to score keyword coverage in this section.");
        }

        return RuleSupport.report(this, context, score, true, issues, suggestions);
    }
}