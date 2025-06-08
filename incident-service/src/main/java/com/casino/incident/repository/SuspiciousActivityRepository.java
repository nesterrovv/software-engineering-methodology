package com.casino.incident.repository;

import com.casino.incident.domain.SuspiciousActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SuspiciousActivityRepository extends JpaRepository<SuspiciousActivity, UUID> {
}
