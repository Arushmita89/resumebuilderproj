package com.resumebuilder.analysis;

import com.resumebuilder.resume.ExperienceItem;
import com.resumebuilder.resume.Resume;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Deterministic formatting and structure checks. Each violation both deducts points
 * and records a {@link AnalysisDtos.FormattingIssue} shown on the Formatting tab.
 */
@Component
public class FormattingRule implements AnalysisRule {

    private static final int MAX_POINTS = 25;
    private static final int MAX_BULLETS_PER_ROLE = 8;
    private static final String WARNING = "warning";
    private static final String ERROR = "error";

    @Override
    public String name() {
        return "Formatting";
    }

    @Override
    public String key() {
        return "formatting";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public AnalysisDtos.SectionReport evaluate(AnalysisContext context) {
        Resume resume = context.resume();
        int score = MAX_POINTS;
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (!RuleSupport.hasText(resume.getFullName())) {
            score -= violation(context, issues, suggestions, "NAME_MISSING",
                    "Full name missing", "Add your full name at the top of the resume.", 3, ERROR);
        }

        String email = resume.getEmail();
        if (!RuleSupport.hasText(email) || !email.contains("@") || email.startsWith("@") || email.endsWith("@")) {
            score -= violation(context, issues, suggestions, "EMAIL_FORMAT",
                    "Invalid email format", "Use a valid email address such as arushmita@gmail.com.", 3, ERROR);
        }

        String phone = resume.getPhone();
        if (!RuleSupport.hasText(phone) || phone.replaceAll("\\D", "").length() < 10) {
            score -= violation(context, issues, suggestions, "PHONE_FORMAT",
                    "Phone number is not a standard 10-digit number",
                    "Use a 10-digit phone number with your country code.", 3, ERROR);
        }

        for (String url : Arrays.asList(resume.getLinkedin(), resume.getGithub(), resume.getPortfolio())) {
            if (RuleSupport.hasText(url) && !url.contains(".")) {
                score -= violation(context, issues, suggestions, "URL_FORMAT",
                        "Malformed profile URL",
                        "Write profile links as full URLs, for example linkedin.com/in/arushmita.", 2, WARNING);
                break;
            }
        }

        boolean datedExperience = context.experience().stream()
                .allMatch(item -> RuleSupport.hasText(item.getStartDate()));
        if (!datedExperience) {
            score -= violation(context, issues, suggestions, "DATES_MISSING",
                    "Experience entries are missing start dates",
                    "Add a start date to every experience entry.", 3, ERROR);
        }

        boolean longBullets = context.experience().stream()
                .flatMap(item -> (item.getBullets() == null ? List.<String>of() : item.getBullets()).stream())
                .anyMatch(bullet -> bullet != null && bullet.length() > RuleSupport.BULLET_MAX_LENGTH);
        if (longBullets) {
            score -= violation(context, issues, suggestions, "BULLET_LENGTH",
                    "Bullet points longer than " + RuleSupport.BULLET_MAX_LENGTH + " characters",
                    "Split long bullets into shorter lines of about 15 words each.", 3, WARNING);
        }

        boolean tooManyBullets = context.experience().stream()
                .anyMatch(item -> item.getBullets() != null && item.getBullets().size() > MAX_BULLETS_PER_ROLE);
        if (tooManyBullets) {
            score -= violation(context, issues, suggestions, "BULLET_COUNT",
                    "More than " + MAX_BULLETS_PER_ROLE + " bullets in a single role",
                    "Keep the most important 5-6 bullets per role.", 3, WARNING);
        }

        String summary = resume.getProfessionalSummary();
        if (RuleSupport.hasText(summary) && summary.length() > RuleSupport.SUMMARY_MAX_LENGTH) {
            score -= violation(context, issues, suggestions, "SUMMARY_LENGTH",
                    "Professional summary is too long",
                    "Shorten the summary to " + RuleSupport.SUMMARY_MAX_LENGTH + " characters or fewer.", 3, WARNING);
        }

        boolean hasContentSection = !context.experience().isEmpty()
                || !context.education().isEmpty()
                || !context.projects().isEmpty()
                || !context.certifications().isEmpty();
        if (!hasContentSection) {
            score -= violation(context, issues, suggestions, "NO_CONTENT_SECTIONS",
                    "No content sections present",
                    "Add education, experience, projects or certifications so the resume has substance.", 2, ERROR);
        }

        return RuleSupport.report(this, context, score, true, issues, suggestions);
    }

    private int violation(AnalysisContext context, List<String> issues, List<String> suggestions,
                          String id, String issue, String suggestion, int penalty, String severity) {
        issues.add(issue);
        suggestions.add(suggestion);
        context.addFormattingIssue(id, issue, suggestion, severity);
        return penalty;
    }
}