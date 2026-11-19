package com.resumebuilder.analysis;

public interface AnalysisRule {

    String name();

    String key();

    int maxPoints();

    AnalysisDtos.SectionReport evaluate(AnalysisContext context);
}