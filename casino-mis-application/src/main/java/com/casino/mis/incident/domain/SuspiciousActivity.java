package com.casino.mis.incident.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SuspiciousActivity {

    @Id
    @GeneratedValue
    private UUID id;

    private String shortDescription;

    private OffsetDateTime occurredAt = OffsetDateTime.now();

    private String location;

    @ElementCollection
    private List<String> participants;

    @Enumerated(EnumType.STRING)
    private RiskLevel risk;

    @Enumerated(EnumType.STRING)
    private ActivityStatus status = ActivityStatus.OPEN;

    public enum RiskLevel { LOW, MEDIUM, HIGH }

    public enum ActivityStatus { OPEN, RESOLVED }
}
