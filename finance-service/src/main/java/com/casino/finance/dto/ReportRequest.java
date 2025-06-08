package com.casino.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportRequest {

    private LocalDate periodStart;
    private LocalDate periodEnd;

}
