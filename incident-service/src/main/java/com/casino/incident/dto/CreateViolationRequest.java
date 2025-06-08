package com.casino.incident.dto;

import com.casino.incident.domain.ViolationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateViolationRequest {

    @NotNull
    private UUID employeeId;

    @NotNull
    private ViolationType type;

    private String description;

    private List<String> attachmentUrls;

}
