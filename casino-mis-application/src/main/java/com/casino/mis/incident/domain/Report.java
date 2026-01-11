package com.casino.mis.incident.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Report {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    private ReportType type;

    private OffsetDateTime generatedAt = OffsetDateTime.now();

    private OffsetDateTime periodStart;

    private OffsetDateTime periodEnd;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String reportData; // JSON данные отчёта

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.GENERATED;

    private UUID generatedBy;
}

