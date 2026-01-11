package com.casino.incident.dto;

import com.casino.incident.domain.ReportStatus;
import com.casino.incident.domain.ReportType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponse {

    private UUID id;
    private ReportType type;
    private OffsetDateTime generatedAt;
    private OffsetDateTime periodStart;
    private OffsetDateTime periodEnd;
    private String reportData;
    private ReportStatus status;
    private UUID generatedBy;
}


