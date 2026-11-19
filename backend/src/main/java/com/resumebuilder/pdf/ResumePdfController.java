package com.resumebuilder.pdf;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes/{resumeId}/pdf")
public class ResumePdfController {

    private final ResumePdfService pdfService;

    public ResumePdfController(ResumePdfService pdfService) {
        this.pdfService = pdfService;
    }

    @GetMapping
    public ResponseEntity<byte[]> download(Authentication authentication, @PathVariable Long resumeId) {
        byte[] pdfBytes = pdfService.generate(authentication, resumeId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resume.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}