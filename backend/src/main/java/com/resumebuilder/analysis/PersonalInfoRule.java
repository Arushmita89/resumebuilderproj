package com.resumebuilder.analysis;

import com.resumebuilder.resume.Resume;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Personal information block: identity, contact channels and the professional summary.
 */
@Component
public class PersonalInfoRule implements AnalysisRule {

    private static final int MAX_POINTS = 15;

    @Override
    public String name() {
        return "Personal Information";
    }

    @Override
    public String key() {
        return "personal";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public AnalysisDtos.SectionReport evaluate(AnalysisContext context) {
        Resume resume = context.resume();
        int score = 0;
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (RuleSupport.hasText(resume.getFullName())) {
            score += 2;
        } else {
            issues.add("Full name is missing");
            suggestions.add("Add your full name exactly as it appears on official documents.");
        }

        if (RuleSupport.hasText(resume.getEmail())) {
            score += 2;
        } else {
            issues.add("Email address is missing");
            suggestions.add("Add a professional email address so recruiters can reply directly.");
        }

        if (RuleSupport.hasText(resume.getPhone())) {
            score += 2;
        } else {
            issues.add("Phone number is missing");
            suggestions.add("Add a phone number with country code, for example +91 98765 43210.");
        }

        if (RuleSupport.hasText(resume.getLocation())) {
            score += 2;
        } else {
            issues.add("Location is missing");
            suggestions.add("Add your city and state — many applicant tracking systems filter on location.");
        }

        if (RuleSupport.hasText(resume.getLinkedin())) {
            score += 2;
        } else {
            issues.add("LinkedIn profile is missing");
            suggestions.add("Add a LinkedIn URL; it is the first profile recruiters verify.");
        }

        if (RuleSupport.hasText(resume.getGithub()) || RuleSupport.hasText(resume.getPortfolio())) {
            score += 2;
        } else {
            issues.add("GitHub or portfolio link is missing");
            suggestions.add("Add a GitHub or portfolio link so your code can be reviewed.");
        }

        String summary = resume.getProfessionalSummary();
        if (!RuleSupport.hasText(summary)) {
            issues.add("Professional summary is missing");
            suggestions.add("Add a 2-3 line professional summary describing your role and strongest skills.");
        } else if (summary.length() < RuleSupport.SUMMARY_MIN_LENGTH) {
            score += 1;
            issues.add("Professional summary is too short");
            suggestions.add("Expand the summary to at least " + RuleSupport.SUMMARY_MIN_LENGTH
                    + " characters and mention your target role.");
        } else if (summary.length() > RuleSupport.SUMMARY_MAX_LENGTH) {
            score += 2;
            issues.add("Professional summary is longer than " + RuleSupport.SUMMARY_MAX_LENGTH + " characters");
            suggestions.add("Trim the summary to " + RuleSupport.SUMMARY_MAX_LENGTH
                    + " characters or fewer so it stays readable at a glance.");
        } else {
            score += 3;
        }

        boolean present = RuleSupport.hasText(resume.getFullName()) || RuleSupport.hasText(resume.getEmail());
        return RuleSupport.report(this, context, score, present, issues, suggestions);
    }
}