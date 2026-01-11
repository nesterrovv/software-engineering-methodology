package com.casino.mis.incident.dto;

import com.casino.mis.incident.domain.ComplaintCategory;
import com.casino.mis.incident.domain.ComplaintSource;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateComplaintRequest {

    @NotNull
    private ComplaintCategory category;

    @NotNull
    private String description;

    private ComplaintSource source = ComplaintSource.VISITOR;

    private String reporterName;

    private UUID relatedIncidentId;
}

