package com.resumebuilder.pdf;

import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import com.resumebuilder.resume.CertificationItem;
import com.resumebuilder.resume.EducationItem;
import com.resumebuilder.resume.ExperienceItem;
import com.resumebuilder.resume.ProjectItem;
import com.resumebuilder.resume.Resume;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifies the exported PDF mirrors the on-screen preview: all six
 * sections, in preview order, with the same entry/skill/date content.
 */
class ResumePdfServiceTests {

    private final ResumePdfService service = new ResumePdfService(null);

    private Resume fullResume(String template) {
        Resume r = new Resume();
        r.setTemplate(template);
        r.setFullName("Arushmita Singh");
        r.setTargetJobTitle("Software Developer");
        r.setEmail("arushmita.singh@gmail.com");
        r.setPhone("+91 98765 43210");
        r.setLocation("Kolkata, West Bengal");
        r.setLinkedin("linkedin.com/in/arushmitasingh");
        r.setGithub("github.com/arushmitasingh");
        r.setProfessionalSummary(
                "Final-year B.Tech student specialising in Java and backend development.");
        r.setSkillTechnical("Java, Spring Boot, REST API, MySQL");
        r.setSkillSoft("Problem solving, Teamwork");
        r.setSkillLanguages("English, Hindi, Bengali");

        EducationItem edu = new EducationItem();
        edu.setSchool("Techno Main Campus, Kolkata");
        edu.setDegree("B.Tech");
        edu.setField("Computer Science and Engineering");
        edu.setStartDate("Aug 2022");
        edu.setEndDate("Jun 2026");
        edu.setGpa("8.6");
        r.getEducation().add(edu);

        ExperienceItem current = new ExperienceItem();
        current.setTitle("Java Developer Intern");
        current.setCompany("CodeCraft Solutions");
        current.setLocation("Kolkata");
        current.setStartDate("Jun 2025");
        current.setEndDate(null);
        current.setCurrent(true);
        current.getBullets().add("Developed 12 REST API endpoints in Spring Boot.");
        current.getBullets().add("Reduced report generation time by 35%.");
        r.getExperience().add(current);

        ProjectItem project = new ProjectItem();
        project.setName("Automated Resume Builder");
        project.setTech("React, Spring Boot, MySQL");
        project.setStartDate("Jan 2026");
        project.setEndDate("Apr 2026");
        project.setLink("github.com/arushmitasingh/resume-builder");
        project.setDescription("Rule-based resume analysis platform with JWT authentication.");
        r.getProjects().add(project);

        CertificationItem cert = new CertificationItem();
        cert.setName("Oracle Java SE 8 Associate");
        cert.setIssuer("Oracle");
        cert.setYear("2024");
        r.getCertifications().add(cert);
        return r;
    }

    private String extract(byte[] pdf) throws Exception {
        PdfReader reader = new PdfReader(pdf);
        try {
            StringBuilder sb = new StringBuilder();
            PdfTextExtractor extractor = new PdfTextExtractor(reader);
            for (int i = 1; i <= reader.getNumberOfPages(); i++) {
                sb.append(extractor.getTextFromPage(i)).append('\n');
            }
            return sb.toString();
        } finally {
            reader.close();
        }
    }

    private static boolean isPdf(byte[] bytes) {
        return bytes.length > 4
                && new String(bytes, 0, 5, StandardCharsets.ISO_8859_1).equals("%PDF-");
    }

    @Test
    void everyTemplateRendersValidPdf() {
        for (String template : new String[]{"modern", "classic", "professional",
                "minimal", "elegant", "simple", null}) {
            byte[] pdf = service.render(fullResume(template));
            assertTrue(isPdf(pdf), "template " + template + " must produce a PDF");
            assertTrue(pdf.length > 1500, "template " + template + " PDF unexpectedly small");
        }
    }

    @Test
    void pdfMirrorsPreviewContent() throws Exception {
        String text = extract(service.render(fullResume("modern")));
        String flat = text.replaceAll("\\s+", " ");

        assertTrue(flat.contains("Arushmita Singh"), "name missing");
        assertTrue(flat.contains("Software Developer"), "professional title missing");
        assertTrue(flat.contains("+91 98765 43210"), "phone missing");
        assertTrue(flat.contains("arushmita.singh@gmail.com"), "email missing");
        assertTrue(flat.contains("Kolkata, West Bengal"), "location missing");
        assertTrue(flat.contains("linkedin.com/in/arushmitasingh"), "linkedin missing");

        assertTrue(flat.contains("PROFESSIONAL SUMMARY"), "summary section missing");
        assertTrue(flat.contains("Final-year B.Tech student"), "summary text missing");

        assertTrue(flat.contains("EDUCATION"), "education section missing");
        assertTrue(flat.contains("Techno Main Campus, Kolkata"), "school missing");
        assertTrue(flat.contains("B.Tech, Computer Science and Engineering · CGPA 8.6"), "degree missing");
        assertTrue(flat.contains("Aug 2022 — Jun 2026"), "education date range missing");

        assertTrue(flat.contains("SKILLS"), "skills section missing");
        assertTrue(flat.contains("Technical: Java, Spring Boot, REST API, MySQL"), "technical skills missing");
        assertTrue(flat.contains("Soft skills: Problem solving, Teamwork"), "soft skills missing");
        assertTrue(flat.contains("Languages: English, Hindi, Bengali"), "languages missing");

        assertTrue(flat.contains("EXPERIENCE"), "experience section missing");
        assertTrue(flat.contains("Java Developer Intern"), "job title missing");
        assertTrue(flat.contains("CodeCraft Solutions, Kolkata"), "company line missing");
        assertTrue(flat.contains("Jun 2025 — Present"), "current role must show Present");
        assertTrue(flat.contains("Developed 12 REST API endpoints in Spring Boot."), "bullet missing");
        assertTrue(flat.contains("Reduced report generation time by 35%."), "second bullet missing");

        assertTrue(flat.contains("PROJECTS"), "projects section missing");
        assertTrue(flat.contains("Automated Resume Builder"), "project name missing");
        assertTrue(flat.contains("React, Spring Boot, MySQL"), "project tech missing");
        assertTrue(flat.contains("Jan 2026 — Apr 2026"), "project date range missing");
        assertTrue(flat.contains("github.com/arushmitasingh/resume-builder"), "project link missing");

        assertTrue(flat.contains("CERTIFICATIONS"), "certifications section missing");
        assertTrue(flat.contains("Oracle Java SE 8 Associate"), "certification name missing");
        assertTrue(flat.contains("Oracle · 2024"), "certification issuer/year missing");
    }

    @Test
    void sectionsAppearInPreviewOrder() throws Exception {
        String text = extract(service.render(fullResume("modern")));
        String flat = text.replaceAll("\\s+", " ");
        int summary = flat.indexOf("PROFESSIONAL SUMMARY");
        int education = flat.indexOf("EDUCATION");
        int skills = flat.indexOf("SKILLS");
        int experience = flat.indexOf("EXPERIENCE");
        int projects = flat.indexOf("PROJECTS");
        int certifications = flat.indexOf("CERTIFICATIONS");
        assertTrue(summary >= 0 && education > summary, "summary must precede education");
        assertTrue(skills > education, "education must precede skills");
        assertTrue(experience > skills, "skills must precede experience");
        assertTrue(projects > experience, "experience must precede projects");
        assertTrue(certifications > projects, "projects must precede certifications");
    }

    @Test
    void sparseResumeStillRenders() throws Exception {
        Resume r = new Resume();
        r.setTemplate("classic");
        r.setFullName("Minimal Person");
        byte[] pdf = service.render(r);
        assertTrue(isPdf(pdf));
        assertTrue(extract(pdf).contains("Minimal Person"));
    }
}
