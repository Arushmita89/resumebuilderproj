package com.resumebuilder.pdf;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.List;
import com.lowagie.text.ListItem;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.resumebuilder.resume.CertificationItem;
import com.resumebuilder.resume.EducationItem;
import com.resumebuilder.resume.ExperienceItem;
import com.resumebuilder.resume.ProjectItem;
import com.resumebuilder.resume.Resume;
import com.resumebuilder.resume.ResumeService;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Locale;

/**
 * Renders the resume to PDF mirroring the on-screen A4 preview
 * (frontend ResumePreview.jsx + .doc styles in index.css) for every template.
 */
@Service
public class ResumePdfService {

    private final ResumeService resumeService;

    public ResumePdfService(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @Transactional(readOnly = true)
    public byte[] generate(Authentication authentication, Long resumeId) {
        Resume resume = resumeService.requireOwned(authentication, resumeId);
        return render(resume);
    }

    /* ------------------------------------------------------------------ */
    /* Style tokens (mirrors .doc-* CSS)                                   */
    /* ------------------------------------------------------------------ */

    private static final Color INK = new Color(0x0f172a);
    private static final Color BODY = new Color(0x1f2937);
    private static final Color MUTED = new Color(0x475569);
    private static final Color DATE = new Color(0x64748b);
    private static final Color BLUE = new Color(0x1d4ed8);
    private static final Color PANEL = new Color(0xf1f5f9);

    /**
     * Per-template design tokens, one per template offered by the app
     * (modern, classic, professional, minimal, elegant, simple).
     */
    private record DocStyle(Color sectionColor, Color ruleColor, boolean boldName,
                            boolean centered, boolean headerRule, boolean headerPanel) {

        static DocStyle of(String template) {
            String t = template == null ? "" : template.trim().toLowerCase(Locale.ROOT);
            return switch (t) {
                case "classic" -> new DocStyle(INK, new Color(0x94a3b8), true, true, false, false);
                case "professional" -> new DocStyle(new Color(0x1e40af), new Color(0xbfdbfe), true,
                        false, false, true);
                case "minimal" -> new DocStyle(new Color(0x334155), new Color(0xe2e8f0), true,
                        false, false, false);
                case "elegant" -> new DocStyle(MUTED, new Color(0xcbd5e1), false,
                        false, false, false);
                case "simple" -> new DocStyle(INK, INK, true, false, false, false);
                default -> new DocStyle(BLUE, BLUE, true, false, true, false); // modern
            };
        }
    }

    /* ------------------------------------------------------------------ */
    /* Rendering                                                            */
    /* ------------------------------------------------------------------ */

    byte[] render(Resume resume) {
        DocStyle style = DocStyle.of(resume.getTemplate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 43f, 43f, 40f, 40f);
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            writeHeader(document, resume, style);
            writeSummary(document, resume, style);
            writeEducation(document, resume, style);
            writeSkills(document, resume, style);
            writeExperience(document, resume, style);
            writeProjects(document, resume, style);
            writeCertifications(document, resume, style);
        } catch (DocumentException e) {
            throw new IllegalStateException("PDF generation failed for resume " + resume.getId(), e);
        } finally {
            document.close();
        }
        return out.toByteArray();
    }

    private void writeHeader(Document document, Resume resume, DocStyle style) throws DocumentException {
        Paragraph name = new Paragraph(orDefault(resume.getFullName(), "Your Name"), nameFont(style));
        name.setSpacingAfter(2f);
        Paragraph role = new Paragraph(
                orDefault(firstNonBlank(resume.getTargetJobTitle(), resume.getTitle()), "Professional Title"),
                roleFont());
        role.setSpacingAfter(5f);
        Paragraph contact = new Paragraph(String.join("   ·   ", contactParts(resume)), contactFont());
        if (style.centered()) {
            name.setAlignment(Element.ALIGN_CENTER);
            role.setAlignment(Element.ALIGN_CENTER);
            contact.setAlignment(Element.ALIGN_CENTER);
        }
        if (style.headerPanel()) {
            PdfPTable panel = new PdfPTable(1);
            panel.setWidthPercentage(100);
            PdfPCell cell = new PdfPCell();
            cell.setBackgroundColor(PANEL);
            cell.setBorder(Rectangle.LEFT);
            cell.setBorderColorLeft(BLUE);
            cell.setBorderWidthLeft(3f);
            cell.setPadding(10f);
            cell.addElement(name);
            cell.addElement(role);
            cell.addElement(contact);
            panel.addCell(cell);
            panel.setSpacingAfter(15f);
            document.add(panel);
            return;
        }
        document.add(name);
        document.add(role);
        document.add(contact);
        if (style.headerRule()) {
            Paragraph rule = new Paragraph(5f, new Chunk(
                    new LineSeparator(2f, 100f, BLUE, Element.ALIGN_LEFT, -3f)));
            rule.setSpacingBefore(9f);
            rule.setSpacingAfter(0f);
            document.add(rule);
        }
    }

    private void writeSummary(Document document, Resume resume, DocStyle style) throws DocumentException {
        if (hasText(resume.getProfessionalSummary())) {
            addSectionTitle(document, style, "Professional Summary");
            document.add(bodyParagraph(resume.getProfessionalSummary()));
        }
    }

    private void writeEducation(Document document, Resume resume, DocStyle style) throws DocumentException {
        if (resume.getEducation().isEmpty()) {
            return;
        }
        addSectionTitle(document, style, "Education");
        boolean first = true;
        for (EducationItem item : resume.getEducation()) {
            addEntryHead(document, orDefault(item.getSchool(), "Institution name"),
                    dateRange(item.getStartDate(), item.getEndDate(), false), first);
            first = false;
            String sub = join(", ", item.getDegree(), item.getField());
            if (hasText(item.getGpa())) {
                sub = join(" · ", sub, "CGPA " + item.getGpa().trim());
            }
            if (hasText(sub)) {
                document.add(subParagraph(sub));
            }
            if (hasText(item.getDescription())) {
                document.add(bodyParagraph(item.getDescription()));
            }
        }
    }

    private void writeSkills(Document document, Resume resume, DocStyle style) throws DocumentException {
        boolean technical = hasText(resume.getSkillTechnical());
        boolean soft = hasText(resume.getSkillSoft());
        boolean languages = hasText(resume.getSkillLanguages());
        if (!technical && !soft && !languages) {
            return;
        }
        addSectionTitle(document, style, "Skills");
        if (technical) {
            document.add(skillRow("Technical:", resume.getSkillTechnical()));
        }
        if (soft) {
            document.add(skillRow("Soft skills:", resume.getSkillSoft()));
        }
        if (languages) {
            document.add(skillRow("Languages:", resume.getSkillLanguages()));
        }
    }

    private void writeExperience(Document document, Resume resume, DocStyle style) throws DocumentException {
        if (resume.getExperience().isEmpty()) {
            return;
        }
        addSectionTitle(document, style, "Experience");
        boolean first = true;
        for (ExperienceItem item : resume.getExperience()) {
            addEntryHead(document, orDefault(item.getTitle(), "Job title"),
                    dateRange(item.getStartDate(), item.getEndDate(), item.isCurrent()), first);
            first = false;
            String sub = join(", ", item.getCompany(), item.getLocation());
            if (hasText(sub)) {
                document.add(subParagraph(sub));
            }
            if (hasText(item.getDescription())) {
                document.add(bodyParagraph(item.getDescription()));
            }
            java.util.List<String> bullets = item.getBullets();
            if (bullets != null && bullets.stream().anyMatch(ResumePdfService::hasText)) {
                List list = new List();
                list.setListSymbol(new Chunk("•  ", bulletFont()));
                list.setIndentationLeft(11f);
                for (String bullet : bullets) {
                    if (hasText(bullet)) {
                        ListItem li = new ListItem(bullet, bulletFont());
                        li.setLeading(11f);
                        list.add(li);
                    }
                }
                Paragraph wrap = new Paragraph();
                wrap.setSpacingBefore(2f);
                wrap.add(list);
                document.add(wrap);
            }
        }
    }

    private void writeProjects(Document document, Resume resume, DocStyle style) throws DocumentException {
        if (resume.getProjects().isEmpty()) {
            return;
        }
        addSectionTitle(document, style, "Projects");
        boolean first = true;
        for (ProjectItem item : resume.getProjects()) {
            addEntryHead(document, orDefault(item.getName(), "Project name"),
                    dateRange(item.getStartDate(), item.getEndDate(), false), first);
            first = false;
            if (hasText(item.getTech())) {
                document.add(subParagraph(item.getTech()));
            }
            if (hasText(item.getDescription())) {
                document.add(bodyParagraph(item.getDescription()));
            }
            if (hasText(item.getLink())) {
                Paragraph link = new Paragraph(item.getLink(), dateFont());
                link.setSpacingBefore(1f);
                document.add(link);
            }
        }
    }

    private void writeCertifications(Document document, Resume resume, DocStyle style)
            throws DocumentException {
        if (resume.getCertifications().isEmpty()) {
            return;
        }
        addSectionTitle(document, style, "Certifications");
        boolean first = true;
        for (CertificationItem item : resume.getCertifications()) {
            addEntryHead(document, orDefault(item.getName(), "Certification name"), null, first);
            first = false;
            String sub = join(" · ", item.getIssuer(), item.getYear());
            if (hasText(sub)) {
                document.add(subParagraph(sub));
            }
        }
    }

    /* ------------------------------------------------------------------ */
    /* Building blocks                                                      */
    /* ------------------------------------------------------------------ */

    private void addSectionTitle(Document document, DocStyle style, String label)
            throws DocumentException {
        Chunk text = new Chunk(label.toUpperCase(Locale.ROOT), sectionFont(style));
        text.setCharacterSpacing(0.7f);
        Paragraph title = new Paragraph(10f, text);
        title.setSpacingBefore(15f);
        document.add(title);
        Paragraph rule = new Paragraph(4f, new Chunk(
                new LineSeparator(0.75f, 100f, style.ruleColor(), Element.ALIGN_LEFT, -2f)));
        rule.setSpacingAfter(6f);
        document.add(rule);
    }

    /**
     * Two-column head matching .doc-entry-head: bold title on the left,
     * date range on the right, on one line.
     */
    private void addEntryHead(Document document, String title, String right, boolean first)
            throws DocumentException {
        PdfPTable head = new PdfPTable(2);
        head.setWidthPercentage(100);
        head.setWidths(new float[]{72f, 28f});
        head.setSpacingBefore(first ? 0f : 8f);
        PdfPCell left = new PdfPCell(new Paragraph(11f, title, entryTitleFont()));
        PdfPCell rightCell = new PdfPCell(
                new Paragraph(10f, right == null ? " " : right, dateFont()));
        left.setBorder(Rectangle.NO_BORDER);
        rightCell.setBorder(Rectangle.NO_BORDER);
        left.setPadding(0f);
        rightCell.setPadding(0f);
        left.setVerticalAlignment(Element.ALIGN_BOTTOM);
        rightCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        head.addCell(left);
        head.addCell(rightCell);
        document.add(head);
    }

    private Paragraph bodyParagraph(String text) {
        Paragraph p = new Paragraph(text, bodyFont());
        p.setLeading(12f);
        p.setSpacingBefore(1f);
        return p;
    }

    private Paragraph subParagraph(String text) {
        Paragraph p = new Paragraph(text, subFont());
        p.setLeading(11f);
        p.setSpacingBefore(1f);
        return p;
    }

    private Paragraph skillRow(String label, String values) {
        Paragraph p = new Paragraph(12f);
        p.setSpacingBefore(0f);
        p.add(new Chunk(label + "   ", skillLabelFont()));
        p.add(new Chunk(values, bodyFont()));
        return p;
    }

    private static java.util.List<String> contactParts(Resume resume) {
        java.util.List<String> parts = new ArrayList<>();
        if (hasText(resume.getPhone())) parts.add(resume.getPhone().trim());
        if (hasText(resume.getEmail())) parts.add(resume.getEmail().trim());
        if (hasText(resume.getLocation())) parts.add(resume.getLocation().trim());
        if (hasText(resume.getLinkedin())) parts.add(resume.getLinkedin().trim());
        if (hasText(resume.getGithub())) parts.add(resume.getGithub().trim());
        return parts;
    }

    /** Same range logic as dateRange() in ResumePreview.jsx. */
    private static String dateRange(String start, String end, boolean current) {
        if (!hasText(start) && !hasText(end)) {
            return null;
        }
        if (current || (!hasText(end) && hasText(start))) {
            return start + " — Present";
        }
        return (start == null ? "" : start) + " — " + (end == null ? "" : end);
    }

    private static String join(String separator, Object... parts) {
        StringBuilder sb = new StringBuilder();
        for (Object part : parts) {
            String value = part == null ? null : String.valueOf(part).trim();
            if (value == null || value.isEmpty()) {
                continue;
            }
            if (sb.length() > 0) {
                sb.append(separator);
            }
            sb.append(value);
        }
        return sb.toString();
    }

    private static String firstNonBlank(String a, String b) {
        return hasText(a) ? a : b;
    }

    private static String orDefault(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    /* ------------------------------------------------------------------ */
    /* Fonts (sizes mirror the .doc CSS at ~0.75 px → pt)                   */
    /* ------------------------------------------------------------------ */

    private Font nameFont(DocStyle style) {
        return FontFactory.getFont(FontFactory.HELVETICA, 18f,
                style.boldName() ? Font.BOLD : Font.NORMAL, INK);
    }

    private Font roleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 9.5f, Font.BOLD, BODY);
    }

    private Font contactFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 7.5f, Font.NORMAL, MUTED);
    }

    private Font sectionFont(DocStyle style) {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8f, Font.BOLD, style.sectionColor());
    }

    private Font entryTitleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 8.5f, Font.BOLD, INK);
    }

    private Font subFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 8f, Font.NORMAL, MUTED);
    }

    private Font dateFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 7.5f, Font.NORMAL, DATE);
    }

    private Font bodyFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 8f, Font.NORMAL, BODY);
    }

    private Font bulletFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 8f, Font.NORMAL, BODY);
    }

    private Font skillLabelFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 8f, Font.BOLD, new Color(0x334155));
    }
}
