package com.casino.incident.dto;

import com.casino.incident.domain.IncidentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IncidentReportRequest {

    private OffsetDateTime periodStart;
    
    private OffsetDateTime periodEnd;
    
    private List<IncidentType> incidentTypes; // Если null - все типы
    
    private UUID generatedBy;
}


