package com.resumebuilder.resume;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeDtos() {

    public record EducationDto(String school, String degree, String field, String startDate, String endDate,
                               String gpa, String description) {
    }

    public record ExperienceDto(String company, String title, String location, String startDate, String endDate,
                                Boolean current, String description, List<String> bullets) {
    }

    public record ProjectDto(String name, String link, String startDate, String endDate, String description,
                             String tech) {
    }

    public record CertificationDto(String name, String issuer, String year) {
    }

    public record ResumeRequest(
            @NotBlank(message = "A resume title is required")
            String title,
            String template,
            String targetJobTitle,
            String targetJobDescription,
            String fullName,
            String email,
            String phone,
            String location,
            String linkedin,
            String github,
            String portfolio,
            String professionalSummary,
            String skillTechnical,
            String skillSoft,
            String skillLanguages,
            List<EducationDto> education,
            List<ExperienceDto> experience,
            List<ProjectDto> projects,
            List<CertificationDto> certifications) {
    }

    public record ResumeSummary(Long id, String title, String template, String status,
                                String targetJobTitle, LocalDateTime updatedAt,
                                LocalDateTime lastAnalyzedAt, Integer lastAnalysisScore) {
    }

    public record ResumeResponse(Long id, String title, String template, String status, String targetJobTitle,
                                 String targetJobDescription, String fullName, String email, String phone,
                                 String location, String linkedin, String github, String portfolio,
                                 String professionalSummary, String skillTechnical, String skillSoft,
                                 String skillLanguages, List<EducationDto> education, List<ExperienceDto> experience,
                                 List<ProjectDto> projects, List<CertificationDto> certifications,
                                 LocalDateTime createdAt, LocalDateTime updatedAt,
                                 LocalDateTime lastAnalyzedAt, Integer lastAnalysisScore) {
    }
}