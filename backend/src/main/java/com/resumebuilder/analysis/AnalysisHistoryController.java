package com.resumebuilder.analysis;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisHistoryController {

    private final AnalysisService analysisService;

    public AnalysisHistoryController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /** Every analysis run for the signed-in user, newest first. */
    @GetMapping("/history")
    public List<AnalysisDtos.HistorySummary> history(Authentication authentication) {
        return analysisService.history(authentication);
    }

    /** A single run including the full stored report. */
    @GetMapping("/history/{historyId}")
    public AnalysisDtos.HistoryEntry entry(Authentication authentication, @PathVariable Long historyId) {
        return analysisService.entry(authentication, historyId);
    }
}