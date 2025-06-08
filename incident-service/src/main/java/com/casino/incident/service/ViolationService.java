package com.casino.incident.service;

import com.casino.incident.domain.DisciplinaryViolation;
import com.casino.incident.dto.CreateViolationRequest;
import com.casino.incident.mapper.ViolationMapper;
import com.casino.incident.repository.DisciplinaryViolationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ViolationService {

    private final DisciplinaryViolationRepository repo;

    public ViolationService(DisciplinaryViolationRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public DisciplinaryViolation create(CreateViolationRequest req) {
        return repo.save(ViolationMapper.toEntity(req));
    }

    public List<DisciplinaryViolation> all() {
        return repo.findAll();
    }

    public DisciplinaryViolation get(UUID id) {
        return repo.findById(id).orElseThrow();
    }
}
