package com.casino.mis.staff.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "shift_schedules")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShiftSchedule {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID employeeId;

    private LocalDate shiftDate;

    private OffsetDateTime plannedStartTime;

    private OffsetDateTime plannedEndTime;

    @Enumerated(EnumType.STRING)
    private ShiftStatus status = ShiftStatus.DRAFT; // DRAFT, PUBLISHED, CONFIRMED, CANCELLED

    @Enumerated(EnumType.STRING)
    private ShiftType shiftType; // DAY, NIGHT, EVENING

    private String location; // Место работы (например, "Игровой зал", "Бар")

    private UUID createdBy; // Кто создал расписание

    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime publishedAt; // Когда опубликовано

    private UUID confirmedBy; // Кто подтвердил смену

    private OffsetDateTime confirmedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum ShiftStatus {
        DRAFT,      // Черновик
        PUBLISHED,  // Опубликовано
        CONFIRMED,  // Подтверждено
        CANCELLED   // Отменено
    }

    public enum ShiftType {
        DAY,        // Дневная смена
        EVENING,    // Вечерняя смена
        NIGHT       // Ночная смена
    }
}


