package com.casino.incident.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    private ComplaintCategory category;

    private String description;

    private OffsetDateTime reportedAt = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    private ComplaintSource source;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus status = ComplaintStatus.OPEN;

    private String reporterName;

    private UUID relatedIncidentId; // Связь с инцидентом, если есть
}


