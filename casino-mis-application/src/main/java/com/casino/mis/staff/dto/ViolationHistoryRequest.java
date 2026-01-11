package com.casino.mis.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViolationHistoryRequest {
    private UUID employeeId; // Если null - все сотрудники
    private String department; // Подразделение для фильтрации
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private String violationType; // Опциональный фильтр по типу
}


