package com.casino.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RepeatedViolationsResponse {

    private List<EmployeeViolationCount> employees;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeViolationCount {
        private UUID employeeId;
        private Long violationCount;
    }
}


