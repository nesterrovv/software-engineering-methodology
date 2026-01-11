package com.casino.incident.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "incidents")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Incident {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    private IncidentType type;

    private String location;

    private OffsetDateTime occurredAt = OffsetDateTime.now();

    private String description;

    @ElementCollection
    @CollectionTable(name = "incident_participants", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "participant")
    private List<String> participants;

    @ElementCollection
    @CollectionTable(name = "incident_attachments", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "attachment_url")
    private List<String> attachmentUrls;

    @Enumerated(EnumType.STRING)
    private IncidentStatus status = IncidentStatus.OPEN;

    private UUID reportedBy;
}


