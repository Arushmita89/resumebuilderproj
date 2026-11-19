package com.resumebuilder.config;

import com.resumebuilder.template.ResumeTemplate;
import com.resumebuilder.template.TemplateRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TemplateRepository templateRepository;

    public DataSeeder(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Override
    public void run(String... args) {
        if (templateRepository.count() > 0) {
            return;
        }
        List<ResumeTemplate> templates = List.of(
                new ResumeTemplate("modern", "Modern",
                        "Clean single-column layout with a bold accent header. The ATS-safe default.",
                        "Modern", 1),
                new ResumeTemplate("classic", "Classic",
                        "Traditional centered header with clear section rules. Suits conservative industries.",
                        "Classic", 2),
                new ResumeTemplate("professional", "Professional",
                        "Structured two-tone header with a dedicated skills column for experienced roles.",
                        "Professional", 3),
                new ResumeTemplate("minimal", "Minimal",
                        "Ultra-clean single column with no decoration, maximising readability and scan speed.",
                        "Minimal", 4),
                new ResumeTemplate("elegant", "Elegant",
                        "Lightweight typography with generous spacing. Suitable for consulting and MBA applications.",
                        "Professional", 5),
                new ResumeTemplate("simple", "Simple",
                        "Plain and compact layout for early-career applicants with limited experience.",
                        "Minimal", 6));
        templateRepository.saveAll(templates);
    }
}