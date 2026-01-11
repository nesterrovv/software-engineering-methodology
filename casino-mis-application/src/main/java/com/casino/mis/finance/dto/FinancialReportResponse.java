package com.casino.mis.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinancialReportResponse {

    private UUID id;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String csvUrl;
}


