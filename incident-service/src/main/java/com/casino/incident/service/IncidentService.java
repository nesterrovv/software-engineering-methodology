package com.casino.incident.service;

import com.casino.incident.domain.Incident;
import com.casino.incident.domain.IncidentType;
import com.casino.incident.dto.CreateIncidentRequest;
import com.casino.incident.mapper.IncidentMapper;
import com.casino.incident.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class IncidentService {

    private final IncidentRepository repository;

    public IncidentService(IncidentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Incident create(CreateIncidentRequest request) {
        return repository.save(IncidentMapper.toEntity(request));
    }

    public List<Incident> findAll() {
        return repository.findAll();
    }

    public Incident findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Incident not found: " + id));
    }

    public List<Incident> findByPeriod(OffsetDateTime start, OffsetDateTime end) {
        return repository.findByOccurredAtBetween(start, end);
    }

    public List<Incident> findByType(IncidentType type) {
        return repository.findByType(type);
    }

    public List<Incident> findByPeriodAndType(OffsetDateTime start, OffsetDateTime end, IncidentType type) {
        return repository.findByOccurredAtBetweenAndType(start, end, type);
    }
}


