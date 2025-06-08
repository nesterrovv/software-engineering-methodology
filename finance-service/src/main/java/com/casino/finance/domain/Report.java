package com.casino.finance.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Report {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDate periodStart;
    private LocalDate periodEnd;

    private String csvUrl; // link in S3

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.READY;

    enum ReportStatus { READY, PROCESSING }
}
