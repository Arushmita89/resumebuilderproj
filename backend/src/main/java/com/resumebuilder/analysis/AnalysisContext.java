package com.resumebuilder.analysis;

import com.resumebuilder.resume.CertificationItem;
import com.resumebuilder.resume.EducationItem;
import com.resumebuilder.resume.ExperienceItem;
import com.resumebuilder.resume.ProjectItem;
import com.resumebuilder.resume.Resume;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Per-run analysis input. Holds the resume plus derived, pre-computed values that
 * every rule needs: the flattened searchable text and the keyword match result.
 * Rules stay pure functions over this context, which keeps the engine deterministic
 * and easy to unit test.
 */
public class AnalysisContext {

    private final Resume resume;
    private final String jobDescription;
    private final String jobTitle;
    private final String searchableText;
    private final AnalysisDtos.KeywordReport keywords;
    private final List<AnalysisDtos.FormattingIssue> formattingIssues = new ArrayList<>();

    public AnalysisContext(Resume resume, String jobDescription, String jobTitle,
                           String searchableText, AnalysisDtos.KeywordReport keywords) {
        this.resume = resume;
        this.jobDescription = jobDescription == null ? "" : jobDescription.trim();
        this.jobTitle = jobTitle == null ? "" : jobTitle.trim();
        this.searchableText = searchableText == null ? "" : searchableText.toLowerCase(Locale.ROOT);
        this.keywords = keywords;
    }

    /**
     * Collected by {@link FormattingRule} during evaluation and surfaced as a flat list
     * on the report, because the UI shows formatting problems separately from sections.
     */
    public void addFormattingIssue(String id, String label, String message, String severity) {
        formattingIssues.add(new AnalysisDtos.FormattingIssue(id, label, message, severity));
    }

    public List<AnalysisDtos.FormattingIssue> formattingIssues() {
        return List.copyOf(formattingIssues);
    }

    public Resume resume() {
        return resume;
    }

    public String jobDescription() {
        return jobDescription;
    }

    public String jobTitle() {
        return jobTitle;
    }

    public String searchableText() {
        return searchableText;
    }

    public AnalysisDtos.KeywordReport keywords() {
        return keywords;
    }

    public boolean hasJobDescription() {
        return jobDescription.length() >= 80;
    }

    public boolean present(String value) {
        return value != null && !value.isBlank();
    }

    public List<ExperienceItem> experience() {
        return resume.getExperience();
    }

    public List<EducationItem> education() {
        return resume.getEducation();
    }

    public List<ProjectItem> projects() {
        return resume.getProjects();
    }

    public List<CertificationItem> certifications() {
        return resume.getCertifications();
    }

    @Component
    public static class Factory {

        private final KeywordService keywordService;

        public Factory(KeywordService keywordService) {
            this.keywordService = keywordService;
        }

        public AnalysisContext create(Resume resume, String jobDescription) {
            String jobText = jobDescription == null ? "" : jobDescription.trim();
            AnalysisDtos.KeywordReport keywords = keywordService.compare(flatten(resume), jobText);
            return new AnalysisContext(resume, jobText, resume.getTargetJobTitle(), flatten(resume), keywords);
        }

        static String flatten(Resume resume) {
            StringBuilder sb = new StringBuilder();
            append(sb, resume.getFullName());
            append(sb, resume.getEmail());
            append(sb, resume.getPhone());
            append(sb, resume.getLocation());
            append(sb, resume.getLinkedin());
            append(sb, resume.getGithub());
            append(sb, resume.getPortfolio());
            append(sb, resume.getProfessionalSummary());
            append(sb, resume.getTargetJobTitle());
            append(sb, resume.getSkillTechnical());
            append(sb, resume.getSkillSoft());
            append(sb, resume.getSkillLanguages());

            for (EducationItem item : resume.getEducation()) {
                append(sb, item.getSchool());
                append(sb, item.getDegree());
                append(sb, item.getField());
                append(sb, item.getGpa());
                append(sb, item.getDescription());
            }
            for (ExperienceItem item : resume.getExperience()) {
                append(sb, item.getCompany());
                append(sb, item.getTitle());
                append(sb, item.getLocation());
                append(sb, item.getDescription());
                List<String> bullets = item.getBullets();
                if (bullets != null) {
                    for (String bullet : new ArrayList<>(bullets)) {
                        append(sb, bullet);
                    }
                }
            }
            for (ProjectItem item : resume.getProjects()) {
                append(sb, item.getName());
                append(sb, item.getTech());
                append(sb, item.getDescription());
                append(sb, item.getLink());
            }
            for (CertificationItem item : resume.getCertifications()) {
                append(sb, item.getName());
                append(sb, item.getIssuer());
            }
            return sb.toString();
        }

        private static void append(StringBuilder sb, String value) {
            if (value != null && !value.isBlank()) {
                sb.append(value).append('\n');
            }
        }
    }
}