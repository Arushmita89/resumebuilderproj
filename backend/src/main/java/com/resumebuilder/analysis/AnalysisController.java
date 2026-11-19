package com.resumebuilder.analysis;

import com.resumebuilder.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes/{resumeId}/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /** Runs the rule engine. Body is optional; when present its job description is saved first. */
    @PostMapping
    public AnalysisDtos.Report analyze(Authentication authentication, @PathVariable Long resumeId,
                                       @RequestBody(required = false) AnalysisDtos.AnalyzeRequest request) {
        return analysisService.analyze(authentication, resumeId, request);
    }

    /** Most recent stored report for this resume. */
    @GetMapping
    public AnalysisDtos.Report latest(Authentication authentication, @PathVariable Long resumeId) {
        AnalysisDtos.Report report = analysisService.latestReport(authentication, resumeId);
        if (report == null) {
            throw new ResourceNotFoundException("No analysis has been run for this resume yet");
        }
        return report;
    }

    /** The run before the most recent one, for the re-analysis comparison screen. */
    @GetMapping("/previous")
    public AnalysisDtos.Report previous(Authentication authentication, @PathVariable Long resumeId) {
        return analysisService.previousReport(authentication, resumeId);
    }
}