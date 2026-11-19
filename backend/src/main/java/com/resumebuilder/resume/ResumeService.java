package com.resumebuilder.resume;

import com.resumebuilder.analysis.AnalysisHistory;
import com.resumebuilder.analysis.AnalysisHistoryRepository;
import com.resumebuilder.exception.ResourceNotFoundException;
import com.resumebuilder.user.User;
import com.resumebuilder.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ResumeService {

    private static final int COMPLETED_SCORE_THRESHOLD = 80;

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final AnalysisHistoryRepository analysisHistoryRepository;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository,
                         AnalysisHistoryRepository analysisHistoryRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.analysisHistoryRepository = analysisHistoryRepository;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Long currentUserId(Authentication authentication) {
        User user = currentUser(authentication);
        User owner = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return owner.getId();
    }

    public List<ResumeDtos.ResumeSummary> list(Authentication authentication) {
        Long userId = currentUserId(authentication);
        return resumeRepository.findAll().stream()
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(userId))
                .map(this::toSummary)
                .toList();
    }

    public ResumeDtos.ResumeResponse save(Authentication authentication, ResumeDtos.ResumeRequest request) {
        User user = currentUser(authentication);
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setCreatedAt(LocalDateTime.now());
        resume.apply(request);
        resume = resumeRepository.save(resume);
        return toResponse(resume);
    }

    public ResumeDtos.ResumeResponse update(Authentication authentication, Long id, ResumeDtos.ResumeRequest request) {
        Resume resume = requireOwned(authentication, id);
        resume.apply(request);
        resume = resumeRepository.save(resume);
        return toResponse(resume);
    }

    public ResumeDtos.ResumeResponse get(Authentication authentication, Long id) {
        return toResponse(requireOwned(authentication, id));
    }

    public void delete(Authentication authentication, Long id) {
        Resume resume = requireOwned(authentication, id);
        // Analysis runs reference the resume by foreign key, so clear them first. Relying on a
        // database-level cascade would need vendor-specific DDL and would not apply to the
        // in-memory development database.
        analysisHistoryRepository.deleteAll(analysisHistoryRepository.findByResumeId(resume.getId()));
        analysisHistoryRepository.flush();
        resumeRepository.delete(resume);
    }

    public Resume requireOwned(Authentication authentication, Long id) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        if (resume.getUser() == null || !resume.getUser().getId().equals(currentUserId(authentication))) {
            throw new ResourceNotFoundException("Resume not found");
        }
        return resume;
    }

    public ResumeDtos.ResumeSummary toSummary(Resume resume) {
        AnalysisHistory latest = analysisHistoryRepository.findTopByResumeIdOrderByIdDesc(resume.getId())
                .orElse(null);
        Integer score = latest == null ? null : latest.getOverallScore();
        LocalDateTime analyzedAt = latest == null ? null : latest.getCreatedAt();
        return new ResumeDtos.ResumeSummary(resume.getId(), resume.getTitle(), resume.getTemplate(),
                statusOf(score).name(), resume.getTargetJobTitle(), resume.getUpdatedAt(), analyzedAt, score);
    }

    /** DRAFT = never analyzed, ANALYZED = analyzed below the completion threshold, COMPLETED = 80 or above. */
    private ResumeStatus statusOf(Integer score) {
        if (score == null) {
            return ResumeStatus.DRAFT;
        }
        return score >= COMPLETED_SCORE_THRESHOLD ? ResumeStatus.COMPLETED : ResumeStatus.ANALYZED;
    }

    public ResumeDtos.ResumeResponse toResponse(Resume resume) {
        AnalysisHistory latest = analysisHistoryRepository.findTopByResumeIdOrderByIdDesc(resume.getId())
                .orElse(null);
        Integer score = latest == null ? null : latest.getOverallScore();
        LocalDateTime analyzedAt = latest == null ? null : latest.getCreatedAt();

        List<ResumeDtos.EducationDto> education = new ArrayList<>();
        for (EducationItem item : resume.getEducation()) {
            education.add(new ResumeDtos.EducationDto(item.getSchool(), item.getDegree(), item.getField(),
                    item.getStartDate(), item.getEndDate(), item.getGpa(), item.getDescription()));
        }

        List<ResumeDtos.ExperienceDto> experience = new ArrayList<>();
        for (ExperienceItem item : resume.getExperience()) {
            experience.add(new ResumeDtos.ExperienceDto(item.getCompany(), item.getTitle(), item.getLocation(),
                    item.getStartDate(), item.getEndDate(), item.isCurrent(), item.getDescription(),
                    new ArrayList<>(item.getBullets())));
        }

        List<ResumeDtos.ProjectDto> projects = new ArrayList<>();
        for (ProjectItem item : resume.getProjects()) {
            projects.add(new ResumeDtos.ProjectDto(item.getName(), item.getLink(), item.getStartDate(),
                    item.getEndDate(), item.getDescription(), item.getTech()));
        }

        List<ResumeDtos.CertificationDto> certifications = new ArrayList<>();
        for (CertificationItem item : resume.getCertifications()) {
            certifications.add(new ResumeDtos.CertificationDto(item.getName(), item.getIssuer(), item.getYear()));
        }

        return new ResumeDtos.ResumeResponse(resume.getId(), resume.getTitle(), resume.getTemplate(),
                statusOf(score).name(), resume.getTargetJobTitle(), resume.getTargetJobDescription(),
                resume.getFullName(), resume.getEmail(),
                resume.getPhone(), resume.getLocation(), resume.getLinkedin(), resume.getGithub(), resume.getPortfolio(),
                resume.getProfessionalSummary(), resume.getSkillTechnical(), resume.getSkillSoft(),
                resume.getSkillLanguages(), education, experience, projects, certifications,
                resume.getCreatedAt(), resume.getUpdatedAt(), analyzedAt, score);
    }
}