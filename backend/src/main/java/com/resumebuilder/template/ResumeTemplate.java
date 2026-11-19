package com.resumebuilder.template;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "templates")
public class ResumeTemplate {

    @Id
    @Column(name = "template_key")
    private String key;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 40)
    private String category;

    private int sortOrder;

    public ResumeTemplate() {
    }

    public ResumeTemplate(String key, String name, String description, String category, int sortOrder) {
        this.key = key;
        this.name = name;
        this.description = description;
        this.category = category;
        this.sortOrder = sortOrder;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}