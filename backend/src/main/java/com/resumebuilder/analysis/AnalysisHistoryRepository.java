package com.resumebuilder.analysis;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistory, Long> {

    Optional<AnalysisHistory> findTopByResumeIdOrderByIdDesc(Long resumeId);

    List<AnalysisHistory> findTop2ByResumeIdOrderByIdDesc(Long resumeId);

    List<AnalysisHistory> findByResume_User_IdOrderByIdDesc(Long userId);

    /** Removed before the parent resume so the foreign key does not block the delete. */
    List<AnalysisHistory> findByResumeId(Long resumeId);
}