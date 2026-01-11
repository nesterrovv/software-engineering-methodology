package com.casino.incident.dto;

import com.casino.incident.domain.IncidentStatus;
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
public class IncidentResponse {

    private UUID id;
    private IncidentType type;
    private String location;
    private OffsetDateTime occurredAt;
    private String description;
    private List<String> participants;
    private List<String> attachmentUrls;
    private IncidentStatus status;
    private UUID reportedBy;
}


