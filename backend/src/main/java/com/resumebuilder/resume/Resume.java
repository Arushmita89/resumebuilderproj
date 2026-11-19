package com.resumebuilder.resume;

import com.resumebuilder.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    private String title;
    private String template;
    private String targetJobTitle;

    @Column(length = 4000)
    private String targetJobDescription;
    private String fullName;
    private String email;
    private String phone;
    private String location;
    private String linkedin;
    private String github;
    private String portfolio;

    @Column(length = 4000)
    private String professionalSummary;

    @Column(length = 2000)
    private String skillTechnical;

    @Column(length = 2000)
    private String skillSoft;

    @Column(length = 2000)
    private String skillLanguages;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderColumn(name = "position")
    private List<EducationItem> education = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderColumn(name = "position")
    private List<ExperienceItem> experience = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderColumn(name = "position")
    private List<ProjectItem> projects = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderColumn(name = "position")
    private List<CertificationItem> certifications = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public String getTargetJobTitle() {
        return targetJobTitle;
    }

    public void setTargetJobTitle(String targetJobTitle) {
        this.targetJobTitle = targetJobTitle;
    }

    public String getTargetJobDescription() {
        return targetJobDescription;
    }

    public void setTargetJobDescription(String targetJobDescription) {
        this.targetJobDescription = targetJobDescription;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(String portfolio) {
        this.portfolio = portfolio;
    }

    public String getProfessionalSummary() {
        return professionalSummary;
    }

    public void setProfessionalSummary(String professionalSummary) {
        this.professionalSummary = professionalSummary;
    }

    public String getSkillTechnical() {
        return skillTechnical;
    }

    public void setSkillTechnical(String skillTechnical) {
        this.skillTechnical = skillTechnical;
    }

    public String getSkillSoft() {
        return skillSoft;
    }

    public void setSkillSoft(String skillSoft) {
        this.skillSoft = skillSoft;
    }

    public String getSkillLanguages() {
        return skillLanguages;
    }

    public void setSkillLanguages(String skillLanguages) {
        this.skillLanguages = skillLanguages;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<EducationItem> getEducation() {
        return education;
    }

    public List<ExperienceItem> getExperience() {
        return experience;
    }

    public List<ProjectItem> getProjects() {
        return projects;
    }

    public List<CertificationItem> getCertifications() {
        return certifications;
    }

    public void apply(ResumeDtos.ResumeRequest request) {
        this.title = request.title();
        this.template = request.template();
        this.targetJobTitle = request.targetJobTitle();
        this.targetJobDescription = request.targetJobDescription();
        this.fullName = request.fullName();
        this.email = request.email();
        this.phone = request.phone();
        this.location = request.location();
        this.linkedin = request.linkedin();
        this.github = request.github();
        this.portfolio = request.portfolio();
        this.professionalSummary = request.professionalSummary();
        this.skillTechnical = request.skillTechnical();
        this.skillSoft = request.skillSoft();
        this.skillLanguages = request.skillLanguages();
        this.updatedAt = LocalDateTime.now();

        applyEducation(request.education());
        applyExperience(request.experience());
        applyProjects(request.projects());
        applyCertifications(request.certifications());
    }

    private void applyEducation(List<ResumeDtos.EducationDto> dtos) {
        education.clear();
        if (dtos == null) {
            return;
        }
        int pos = 0;
        for (ResumeDtos.EducationDto dto : dtos) {
            EducationItem item = new EducationItem();
            item.setResume(this);
            item.setPosition(pos++);
            item.setSchool(dto.school());
            item.setDegree(dto.degree());
            item.setField(dto.field());
            item.setStartDate(dto.startDate());
            item.setEndDate(dto.endDate());
            item.setGpa(dto.gpa());
            item.setDescription(dto.description());
            education.add(item);
        }
    }

    private void applyExperience(List<ResumeDtos.ExperienceDto> dtos) {
        experience.clear();
        if (dtos == null) {
            return;
        }
        int pos = 0;
        for (ResumeDtos.ExperienceDto dto : dtos) {
            ExperienceItem item = new ExperienceItem();
            item.setResume(this);
            item.setPosition(pos++);
            item.setCompany(dto.company());
            item.setTitle(dto.title());
            item.setLocation(dto.location());
            item.setStartDate(dto.startDate());
            item.setEndDate(dto.endDate());
            item.setCurrent(Boolean.TRUE.equals(dto.current()));
            item.setDescription(dto.description());
            item.setBullets(dto.bullets());
            experience.add(item);
        }
    }

    private void applyProjects(List<ResumeDtos.ProjectDto> dtos) {
        projects.clear();
        if (dtos == null) {
            return;
        }
        int pos = 0;
        for (ResumeDtos.ProjectDto dto : dtos) {
            ProjectItem item = new ProjectItem();
            item.setResume(this);
            item.setPosition(pos++);
            item.setName(dto.name());
            item.setLink(dto.link());
            item.setStartDate(dto.startDate());
            item.setEndDate(dto.endDate());
            item.setDescription(dto.description());
            item.setTech(dto.tech());
            projects.add(item);
        }
    }

    private void applyCertifications(List<ResumeDtos.CertificationDto> dtos) {
        certifications.clear();
        if (dtos == null) {
            return;
        }
        int pos = 0;
        for (ResumeDtos.CertificationDto dto : dtos) {
            CertificationItem item = new CertificationItem();
            item.setResume(this);
            item.setPosition(pos++);
            item.setName(dto.name());
            item.setIssuer(dto.issuer());
            item.setYear(dto.year());
            certifications.add(item);
        }
    }
}
