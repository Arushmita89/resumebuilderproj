package com.resumebuilder.resume;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public List<ResumeDtos.ResumeSummary> list(Authentication authentication) {
        return resumeService.list(authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeDtos.ResumeResponse create(Authentication authentication, @Valid @RequestBody ResumeDtos.ResumeRequest request) {
        return resumeService.save(authentication, request);
    }

    @GetMapping("/{id}")
    public ResumeDtos.ResumeResponse get(Authentication authentication, @PathVariable Long id) {
        return resumeService.get(authentication, id);
    }

    @PutMapping("/{id}")
    public ResumeDtos.ResumeResponse update(Authentication authentication, @PathVariable Long id,
                                            @Valid @RequestBody ResumeDtos.ResumeRequest request) {
        return resumeService.update(authentication, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication, @PathVariable Long id) {
        resumeService.delete(authentication, id);
    }
}