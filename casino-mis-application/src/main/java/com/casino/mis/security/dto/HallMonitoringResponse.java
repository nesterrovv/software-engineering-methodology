package com.casino.mis.security.dto;

import com.casino.mis.security.domain.HallMonitoring;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HallMonitoringResponse {
    private UUID id;
    private UUID securityOfficerId;
    private OffsetDateTime startedAt;
    private OffsetDateTime endedAt;
    private HallMonitoring.MonitoringStatus status;
    private Integer activeVisitors;
    private Integer activeStaff;
    private Integer anomaliesDetected;
    private String notes;
}


