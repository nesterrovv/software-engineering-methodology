package com.casino.mis.incident.dto;

import com.casino.mis.incident.domain.IncidentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateIncidentRequest {

    @NotNull
    private IncidentType type;

    private String location;

    private String description;

    private List<String> participants;

    private List<String> attachmentUrls;

    private UUID reportedBy;
}

