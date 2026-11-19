package com.resumebuilder.analysis;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rule-based keyword extraction and matching. No machine learning and no model
 * inference: keywords are pulled from the job description using a fixed technology
 * dictionary plus deterministic token-frequency counting, then matched literally
 * against the flattened resume text.
 */
@Service
public class KeywordService {

    private static final int MAX_KEYWORDS = 15;
    private static final int MIN_JD_LENGTH = 80;
    private static final int MIN_TOKEN_LENGTH = 3;

    private static final Set<String> STOP_WORDS = Set.of(
            "and", "the", "for", "with", "you", "your", "our", "are", "will", "have", "has", "not", "all",
            "can", "who", "from", "that", "this", "job", "role", "work", "working", "team", "teams", "any",
            "but", "out", "get", "got", "his", "her", "she", "they", "them", "their", "been", "being", "would",
            "should", "could", "must", "may", "able", "into", "than", "then", "these", "those", "such",
            "other", "some", "each", "per", "via", "using", "use", "used", "well", "good", "great", "strong",
            "years", "year", "plus", "etc", "com", "www", "http", "https", "new", "one", "two", "want", "need",
            "needs", "looking", "join", "help", "helps", "helping", "make", "makes", "making", "ensure",
            "ensuring", "provide", "providing", "includes", "including", "include", "required", "requirements",
            "responsibilities", "qualifications", "skills", "ability", "knowledge", "experience", "familiar",
            "preferred", "minimum", "least", "apply", "applications", "candidate", "candidates", "ideal",
            "ideally", "opportunity", "company", "client", "clients", "business",
            "write", "writes", "writing", "written", "create", "creates", "creating", "build", "builds",
            "building", "develop", "develops", "developing", "maintain", "maintains", "maintaining",
            "manage", "manages", "managing", "deliver", "delivers", "perform", "performs", "support",
            "supports", "drive", "drives", "improve", "improves", "increase", "increases", "reduce",
            "reduces", "achieve", "achieves", "identify", "identifies", "review", "reviews", "analyze",
            "analyse", "execute", "executes", "involve", "involves", "learn", "learns", "understand",
            "understands", "know", "knows", "excellent", "solid", "proven", "demonstrated", "familiarity",
            "expertise", "proficiency", "degree", "bachelor", "master", "duties", "roles", "day", "days",
            "week", "weeks", "month", "months", "part", "time", "real", "world", "level", "levels",
            "key", "high", "best", "better", "nice", "meet", "helped"
    );

    /**
     * Fixed technology / skill dictionary. Entries are matched on whole words only, so a short
     * term such as "C" or "R" cannot match any longer word that happens to start with the same
     * letter. Multi-word entries are checked before single words so "Spring Boot" wins over a
     * stray "Spring". Keep this list free of case-insensitive duplicates such as "JUnit"/"Junit".
     */
    private static final List<String> TECH_DICTIONARY = List.of(
            "Spring Boot", "Spring Framework", "Spring Security", "Spring Data", "REST API",
            "Microservices", "Design Patterns", "Unit Testing", "CI/CD", "DevOps", "Cloud Computing",
            "Object Oriented Programming", "Data Structures", "Database Design", "Version Control",
            "Full Stack", "Front End", "Back End", "Web Development", "Mobile Development",
            "React", "Angular", "Vue", "Next.js", "Redux", "Node.js", "Express.js", "JavaScript",
            "TypeScript", "HTML5", "CSS3", "Tailwind", "Bootstrap", "jQuery", "Java", "Python",
            "C", "C++", "C#", ".NET", "Go", "Golang", "Ruby", "Rails", "PHP", "Laravel", "Kotlin",
            "Swift", "Scala", "R", "Dart", "Flutter", "React Native", "Android", "iOS",
            "MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQL Server", "SQLite", "Redis",
            "Elasticsearch", "Cassandra", "DynamoDB", "Firebase", "Supabase",
            "Hibernate", "JPA", "JDBC", "JUnit", "Mockito", "Git", "GitHub", "GitLab", "Jenkins",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "Maven", "Gradle",
            "Machine Learning", "Problem Solving", "Communication", "Teamwork", "Leadership",
            "Time Management"
    );

    /** Dictionary normalised to lowercase, longest first so multi-word phrases match first. */
    private static final List<String> DICTIONARY_KEYS = TECH_DICTIONARY.stream()
            .map(term -> term.toLowerCase(Locale.ROOT))
            .sorted(Comparator.comparingInt(String::length).reversed())
            .toList();


    public AnalysisDtos.KeywordReport compare(String resumeText, String jobDescription) {
        String jd = jobDescription == null ? "" : jobDescription.trim();
        String resume = resumeText == null ? "" : resumeText.toLowerCase(Locale.ROOT);

        if (jd.length() < MIN_JD_LENGTH) {
            return new AnalysisDtos.KeywordReport(false, 0, 0, List.of(), List.of(), List.of());
        }

        List<String> extracted = extractKeywords(jd);

        List<AnalysisDtos.KeywordHit> hits = new ArrayList<>();
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String keyword : extracted) {
            int occurrences = countOccurrences(resume, keyword);
            boolean isMatched = occurrences > 0;
            hits.add(new AnalysisDtos.KeywordHit(keyword, isMatched, occurrences));
            if (isMatched) {
                matched.add(keyword);
            } else {
                missing.add(keyword);
            }
        }

        return new AnalysisDtos.KeywordReport(true, matched.size(), extracted.size(),
                hits, matched, missing);
    }

    /**
     * Deterministic extraction: dictionary hits first (ordered by appearance in the JD),
     * then remaining high-frequency tokens that are not dictionary or stop words.
     */
    List<String> extractKeywords(String jobDescription) {
        String jd = jobDescription.toLowerCase(Locale.ROOT);
        String normalised = " " + jd.replaceAll("[^a-z0-9+#.]+", " ") + " ";

        Set<String> found = new LinkedHashSet<>();
        Map<String, Integer> counts = new LinkedHashMap<>();
        Set<String> consumed = new LinkedHashSet<>();

        for (String term : TECH_DICTIONARY) {
            String key = term.toLowerCase(Locale.ROOT);
            if (!containsTerm(normalised, key)) {
                continue;
            }
            String display = displayCase(term);
            if (!found.contains(display)) {
                found.add(display);
            }
            // Words already covered by a dictionary phrase must not reappear as their own
            // keywords, so "REST APIs" never yields both "REST API" and "Apis".
            for (String word : key.split("[^a-z0-9+#.]+")) {
                if (!word.isEmpty()) {
                    consumed.add(word);
                    consumed.add(word + "s");
                }
            }
        }

        for (String rawToken : normalised.trim().split("\\s+")) {
            String token = rawToken.trim();
            if (token.length() < MIN_TOKEN_LENGTH || STOP_WORDS.contains(token)) {
                continue;
            }
            if (consumed.contains(token) || isDictionaryTerm(token)) {
                continue;
            }
            if (token.matches(".*\\d.*")) {
                continue;
            }
            counts.merge(token, 1, Integer::sum);
        }

        List<String> byFrequency = counts.entrySet().stream()
                .filter(entry -> entry.getValue() >= 2)
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed()
                        .thenComparing(Map.Entry.comparingByKey()))
                .limit(MAX_KEYWORDS)
                .map(Map.Entry::getKey)
                .toList();

        for (String token : byFrequency) {
            found.add(displayCase(token));
        }

        List<String> result = new ArrayList<>(found);
        return result.size() > MAX_KEYWORDS ? result.subList(0, MAX_KEYWORDS) : result;
    }

    private boolean isDictionaryTerm(String token) {
        String key = token.toLowerCase(Locale.ROOT);
        return DICTIONARY_KEYS.contains(key);
    }

    /**
     * Whole-word match against space-padded normalised text. A trailing "s" is accepted so
     * "apis" still matches the dictionary term "REST API". Short terms such as "C" therefore
     * only match when the letter stands alone, never inside a longer word.
     */
    private boolean containsTerm(String normalised, String term) {
        if (term.isEmpty()) {
            return false;
        }
        if (normalised.contains(" " + term + " ")) {
            return true;
        }
        if (term.length() <= 3) {
            return false;
        }
        return normalised.contains(" " + term + "s ");
    }

    private int countOccurrences(String haystack, String keyword) {
        if (keyword.isBlank()) {
            return 0;
        }
        Pattern pattern = Pattern.compile("(?<![a-z0-9])" + Pattern.quote(keyword.toLowerCase(Locale.ROOT))
                + "(?![a-z0-9])");
        Matcher matcher = pattern.matcher(haystack);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    static String displayCase(String token) {
        String[] words = token.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (sb.length() > 0) {
                sb.append(' ');
            }
            sb.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
        }
        return sb.toString();
    }

    static List<String> sortForDisplay(List<String> keywords) {
        return keywords.stream()
                .sorted(Comparator.comparingInt(String::length).reversed()
                        .thenComparing(Comparator.naturalOrder()))
                .toList();
    }
}