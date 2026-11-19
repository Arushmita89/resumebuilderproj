package com.resumebuilder.analysis;

public enum SectionStatus {

    COMPLETE,
    GOOD,
    NEEDS_IMPROVEMENT,
    MISSING;

    public static SectionStatus from(int score, int maxPoints, boolean sectionPresent) {
        if (!sectionPresent) {
            return MISSING;
        }
        if (maxPoints <= 0) {
            return MISSING;
        }
        double ratio = (double) score / (double) maxPoints;
        if (ratio >= 0.9) {
            return COMPLETE;
        }
        if (ratio >= 0.7) {
            return GOOD;
        }
        if (ratio >= 0.4) {
            return NEEDS_IMPROVEMENT;
        }
        return MISSING;
    }
}