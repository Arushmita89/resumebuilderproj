package com.resumebuilder.analysis;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Skills section depth: breadth of technical skills plus soft skills and languages.
 */
@Component
public class SkillsRule implements AnalysisRule {

    private static final int MAX_POINTS = 15;
    private static final int MIN_TECHNICAL_SKILLS = 6;

    @Override
    public String name() {
        return "Skills";
    }

    @Override
    public String key() {
        return "skills";
    }

    @Override
    public int maxPoints() {
        return MAX_POINTS;
    }

    @Override
    public AnalysisDtos.SectionReport evaluate(AnalysisContext context) {
        String technical = context.resume().getSkillTechnical();
        String soft = context.resume().getSkillSoft();
        String languages = context.resume().getSkillLanguages();

        int score = 0;
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (RuleSupport.hasText(technical)) {
            score += 3;
        } else {
            issues.add("Technical skills are missing");
            suggestions.add("List your technical skills, separated by commas, for example Java, Spring Boot, MySQL.");
        }

        List<String> technicalList = split(technical);
        if (technicalList.size() >= MIN_TECHNICAL_SKILLS) {
            score += 3;
        } else if (!technicalList.isEmpty()) {
            score += 1;
            issues.add("Only " + technicalList.size() + " technical skills listed");
            suggestions.add("Aim for at least " + MIN_TECHNICAL_SKILLS
                    + " technical skills so keyword matching has enough to work with.");
        }

        if (RuleSupport.hasText(soft)) {
            score += 2;
        } else {
            issues.add("Soft skills are missing");
            suggestions.add("Add 3-4 soft skills such as communication, teamwork or problem solving.");
        }

        if (RuleSupport.hasText(languages)) {
            score += 2;
        } else {
            issues.add("Languages are missing");
            suggestions.add("Add the languages you can read and write, for example English and Hindi.");
        }

        if (context.keywords().jobDescriptionProvided()) {
            score += RuleSupport.keywordPoints(context, 5);
        } else {
            score += 3;
        }

        boolean present = RuleSupport.hasText(technical) || RuleSupport.hasText(soft)
                || RuleSupport.hasText(languages);
        return RuleSupport.report(this, context, score, present, issues, suggestions);
    }

    private List<String> split(String value) {
        if (!RuleSupport.hasText(value)) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}