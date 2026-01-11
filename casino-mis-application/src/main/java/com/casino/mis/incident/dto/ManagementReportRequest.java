package com.casino.mis.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ManagementReportRequest {

    private OffsetDateTime periodStart;
    
    private OffsetDateTime periodEnd;
    
    private UUID generatedBy;
}

