package com.casino.mis.incident.service;

import com.casino.mis.incident.domain.SuspiciousActivity;
import com.casino.mis.incident.repository.SuspiciousActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SuspiciousActivityService {

    private final SuspiciousActivityRepository repository;

    public SuspiciousActivityService(SuspiciousActivityRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SuspiciousActivity create(SuspiciousActivity activity) {
        return repository.save(activity);
    }

    public SuspiciousActivity findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Suspicious activity not found: " + id));
    }

    public List<SuspiciousActivity> findAll() {
        return repository.findAll();
    }
}


