package com.resumebuilder.analysis;

import com.resumebuilder.resume.Resume;
import com.resumebuilder.resume.ResumeService;
import com.resumebuilder.user.User;
import com.resumebuilder.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AnalysisService {

    private final ResumeAnalyzer analyzer;
    private final AnalysisContext.Factory contextFactory;
    private final ResumeService resumeService;
    private final UserRepository userRepository;
    private final AnalysisHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public AnalysisService(ResumeAnalyzer analyzer, AnalysisContext.Factory contextFactory,
                           ResumeService resumeService, UserRepository userRepository,
                           AnalysisHistoryRepository historyRepository, ObjectMapper objectMapper) {
        this.analyzer = analyzer;
        this.contextFactory = contextFactory;
        this.resumeService = resumeService;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
    }

    public AnalysisDtos.Report analyze(Authentication authentication, Long resumeId,
                                       AnalysisDtos.AnalyzeRequest request) {
        Resume resume = resumeService.requireOwned(authentication, resumeId);

        if (request != null) {
            if (request.jobDescription() != null && !request.jobDescription().isBlank()) {
                resume.setTargetJobDescription(request.jobDescription().trim());
            }
            if (request.jobTitle() != null && !request.jobTitle().isBlank()) {
                resume.setTargetJobTitle(request.jobTitle().trim());
            }
            resume.setUpdatedAt(LocalDateTime.now());
        }

        AnalysisContext context = contextFactory.create(resume, resume.getTargetJobDescription());
        AnalysisDtos.Report report = analyzer.analyze(resume, resume.getTargetJobDescription(),
                resume.getTargetJobTitle(), context);

        persist(resume, report);
        return report;
    }

    /** Latest stored report for a resume, or {@code null} if it has never been analyzed. */
    public AnalysisDtos.Report latestReport(Authentication authentication, Long resumeId) {
        resumeService.requireOwned(authentication, resumeId);
        return historyRepository.findTopByResumeIdOrderByIdDesc(resumeId)
                .map(history -> readReport(history.getReportJson()))
                .orElse(null);
    }

    /** The report before the most recent one, used to show score improvement after edits. */
    public AnalysisDtos.Report previousReport(Authentication authentication, Long resumeId) {
        resumeService.requireOwned(authentication, resumeId);
        return historyRepository.findTop2ByResumeIdOrderByIdDesc(resumeId).stream()
                .skip(1)
                .findFirst()
                .map(history -> readReport(history.getReportJson()))
                .orElse(null);
    }

    public AnalysisDtos.HistoryEntry latest(Authentication authentication, Long resumeId) {
        resumeService.requireOwned(authentication, resumeId);
        return historyRepository.findTopByResumeIdOrderByIdDesc(resumeId)
                .map(this::toEntry)
                .orElse(null);
    }

    public List<AnalysisDtos.HistorySummary> history(Authentication authentication) {
        Long userId = currentUserId(authentication);
        return historyRepository.findByResume_User_IdOrderByIdDesc(userId).stream()
                .map(history -> new AnalysisDtos.HistorySummary(
                        history.getId(),
                        history.getResume() == null ? null : history.getResume().getId(),
                        history.getResume() == null ? "Deleted resume" : history.getResume().getTitle(),
                        history.getOverallScore(),
                        history.getCreatedAt()))
                .toList();
    }

    public AnalysisDtos.HistoryEntry entry(Authentication authentication, Long historyId) {
        Long userId = currentUserId(authentication);
        AnalysisHistory history = historyRepository.findById(historyId)
                .filter(h -> h.getResume() != null && h.getResume().getUser() != null
                        && h.getResume().getUser().getId().equals(userId))
                .orElse(null);
        return history == null ? null : toEntry(history);
    }

    private AnalysisDtos.HistoryEntry toEntry(AnalysisHistory history) {
        return new AnalysisDtos.HistoryEntry(
                history.getId(),
                history.getResume() == null ? null : history.getResume().getId(),
                history.getResume() == null ? "Deleted resume" : history.getResume().getTitle(),
                history.getOverallScore(),
                history.getCreatedAt(),
                readReport(history.getReportJson()));
    }

    private void persist(Resume resume, AnalysisDtos.Report report) {
        AnalysisHistory history = new AnalysisHistory();
        history.setResume(resume);
        history.setOverallScore(report.overallScore());
        history.setReportJson(toJson(report));
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.save(history);
    }

    private Long currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new com.resumebuilder.exception.ResourceNotFoundException("User not found"));
    }

    private AnalysisDtos.Report readReport(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, AnalysisDtos.Report.class);
        } catch (Exception e) {
            return null;
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{\"error\":\"report serialization failed\"}";
        }
    }
}