package com.casino.mis.finance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinancialReportRequest {

    @NotNull
    private LocalDate periodStart;
    
    @NotNull
    private LocalDate periodEnd;
}

