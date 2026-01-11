package com.casino.mis.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViolationHistoryResponse {
    private List<ViolationRecord> violations;
    private Summary summary;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ViolationRecord {
        private UUID id;
        private UUID employeeId;
        private String employeeName;
        private String violationType;
        private String description;
        private OffsetDateTime occurredAt;
        private String status;
        private String severity; // LOW, MEDIUM, HIGH
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Summary {
        private Long totalViolations;
        private Map<String, Long> byType; // Группировка по типам
        private Map<String, Long> byDepartment; // Группировка по подразделениям
        private Long employeesWithViolations;
    }
}

