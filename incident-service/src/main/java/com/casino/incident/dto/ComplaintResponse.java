package com.casino.incident.dto;

import com.casino.incident.domain.ComplaintCategory;
import com.casino.incident.domain.ComplaintSource;
import com.casino.incident.domain.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComplaintResponse {

    private UUID id;
    private ComplaintCategory category;
    private String description;
    private OffsetDateTime reportedAt;
    private ComplaintSource source;
    private ComplaintStatus status;
    private String reporterName;
    private UUID relatedIncidentId;
}


