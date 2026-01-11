package com.casino.mis.incident.service;

import com.casino.mis.incident.domain.DisciplinaryViolation;
import com.casino.mis.incident.dto.CreateViolationRequest;
import com.casino.mis.incident.mapper.ViolationMapper;
import com.casino.mis.incident.repository.DisciplinaryViolationRepository;
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
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Violation not found: " + id));
    }

    public List<DisciplinaryViolation> findByEmployeeId(UUID employeeId) {
        return repo.findByEmployeeId(employeeId);
    }
}
