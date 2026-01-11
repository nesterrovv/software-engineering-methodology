package com.casino.incident.repository;

import com.casino.incident.domain.Report;
import com.casino.incident.domain.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    
    List<Report> findByType(ReportType type);
    
    List<Report> findByGeneratedAtBetween(java.time.OffsetDateTime start, java.time.OffsetDateTime end);
    
    List<Report> findAll();
}

