package com.casino.incident.repository;

import com.casino.incident.domain.Incident;
import com.casino.incident.domain.IncidentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    
    List<Incident> findByOccurredAtBetween(OffsetDateTime start, OffsetDateTime end);
    
    List<Incident> findByType(IncidentType type);
    
    List<Incident> findByOccurredAtBetweenAndType(OffsetDateTime start, OffsetDateTime end, IncidentType type);
}

