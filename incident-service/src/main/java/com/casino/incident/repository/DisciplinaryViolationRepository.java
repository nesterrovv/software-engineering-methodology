package com.casino.incident.repository;

import com.casino.incident.domain.DisciplinaryViolation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DisciplinaryViolationRepository extends JpaRepository<DisciplinaryViolation, UUID> {
}
