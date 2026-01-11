package com.casino.mis.security.repository;

import com.casino.mis.security.domain.HallMonitoring;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HallMonitoringRepository extends JpaRepository<HallMonitoring, UUID> {
    List<HallMonitoring> findBySecurityOfficerId(UUID securityOfficerId);
    List<HallMonitoring> findByStatus(HallMonitoring.MonitoringStatus status);
}


