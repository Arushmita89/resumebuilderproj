package com.resumebuilder.template;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateRepository extends JpaRepository<ResumeTemplate, String> {

    List<ResumeTemplate> findAllByOrderBySortOrderAsc();
}