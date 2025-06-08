package com.casino.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponse {

    private UUID id;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String csvUrl;

}
