package com.casino.incident.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DisciplinaryViolation {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID employeeId;

    @Enumerated(EnumType.STRING)
    private ViolationType type;

    private String description;

    private OffsetDateTime occurredAt = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    private ViolationStatus status = ViolationStatus.OPEN;

    @ElementCollection
    private List<String> attachmentUrls;

}
