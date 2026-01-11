package com.casino.mis.incident.repository;

import com.casino.mis.incident.domain.SuspiciousActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SuspiciousActivityRepository extends JpaRepository<SuspiciousActivity, UUID> {
}
