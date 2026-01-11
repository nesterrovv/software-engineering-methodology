package com.casino.mis.incident.dto;

import com.casino.mis.incident.domain.ViolationType;
import com.casino.mis.incident.domain.ViolationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViolationResponse {

    private UUID id;
    private UUID employeeId;
    private ViolationType type;
    private String description;
    private OffsetDateTime occurredAt;
    private ViolationStatus status;
    private List<String> attachmentUrls;

}
