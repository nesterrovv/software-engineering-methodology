package com.casino.mis.security.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "hall_monitoring_sessions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HallMonitoring {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID securityOfficerId; // Сотрудник службы безопасности

    private OffsetDateTime startedAt = OffsetDateTime.now();

    private OffsetDateTime endedAt;

    @Enumerated(EnumType.STRING)
    private MonitoringStatus status = MonitoringStatus.ACTIVE;

    private Integer activeVisitors; // Текущее количество посетителей

    private Integer activeStaff; // Текущее количество персонала

    private Integer anomaliesDetected; // Количество обнаруженных аномалий

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum MonitoringStatus {
        ACTIVE,
        PAUSED,
        ENDED
    }
}


