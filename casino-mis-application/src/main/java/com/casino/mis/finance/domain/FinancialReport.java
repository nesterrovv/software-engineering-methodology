package com.casino.mis.finance.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "financial_reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinancialReport {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDate periodStart;
    private LocalDate periodEnd;

    private String csvUrl; // link in S3

    @Enumerated(EnumType.STRING)
    private FinancialReportStatus status = FinancialReportStatus.READY;

    public enum FinancialReportStatus { 
        READY, 
        PROCESSING 
    }
}


