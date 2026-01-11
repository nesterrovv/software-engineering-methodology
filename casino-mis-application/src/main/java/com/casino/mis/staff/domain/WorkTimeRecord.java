package com.casino.mis.staff.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "work_time_records")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkTimeRecord {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID employeeId;

    private OffsetDateTime clockInTime; // Отметка входа

    private OffsetDateTime clockOutTime; // Отметка выхода

    private String deviceId; // ID устройства (терминала доступа)

    @Enumerated(EnumType.STRING)
    private RecordStatus status = RecordStatus.OPEN; // OPEN, CLOSED, MISSING_CLOCK_OUT

    private Long workedMinutes; // Отработанные минуты

    private Boolean isLate = false; // Опоздание

    private Boolean hasOvertime = false; // Переработка

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum RecordStatus {
        OPEN,              // Смена открыта (нет отметки выхода)
        CLOSED,            // Смена закрыта нормально
        MISSING_CLOCK_OUT  // Отсутствует отметка выхода
    }
}


