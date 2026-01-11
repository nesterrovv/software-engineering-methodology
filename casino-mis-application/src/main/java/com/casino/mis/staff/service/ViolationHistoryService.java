package com.casino.mis.staff.service;

import com.casino.mis.staff.client.IncidentServiceClient;
import com.casino.mis.staff.domain.Employee;
import com.casino.mis.staff.dto.ViolationHistoryRequest;
import com.casino.mis.staff.dto.ViolationHistoryResponse;
import com.casino.mis.staff.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ViolationHistoryService {

    private final IncidentServiceClient incidentServiceClient;
    private final EmployeeRepository employeeRepository;

    public ViolationHistoryService(IncidentServiceClient incidentServiceClient,
                                  EmployeeRepository employeeRepository) {
        this.incidentServiceClient = incidentServiceClient;
        this.employeeRepository = employeeRepository;
    }

    // UC22: Просмотр истории нарушений
    public ViolationHistoryResponse getViolationHistory(ViolationHistoryRequest request) {
        ViolationHistoryResponse response = new ViolationHistoryResponse();
        
        // Получаем нарушения через Feign Client из incident модуля
        List<Map<String, Object>> violations;
        
        if (request.getEmployeeId() != null) {
            violations = incidentServiceClient.getViolationsByEmployee(request.getEmployeeId());
        } else {
            violations = incidentServiceClient.getViolations();
            // Фильтруем по типу, если указан
            if (request.getViolationType() != null) {
                violations = violations.stream()
                        .filter(v -> request.getViolationType().equals(v.get("type")))
                        .collect(Collectors.toList());
            }
        }

        // Фильтруем по датам, если указаны
        if (request.getStartDate() != null || request.getEndDate() != null) {
            OffsetDateTime start = request.getStartDate() != null ? request.getStartDate() : OffsetDateTime.MIN;
            OffsetDateTime end = request.getEndDate() != null ? request.getEndDate() : OffsetDateTime.now();
            
            violations = violations.stream()
                    .filter(v -> {
                        Object occurredAtObj = v.get("occurredAt");
                        if (occurredAtObj == null) return false;
                        OffsetDateTime occurredAt = parseDateTime(occurredAtObj);
                        return occurredAt.isAfter(start) && occurredAt.isBefore(end);
                    })
                    .collect(Collectors.toList());
        }

        // Фильтруем по подразделению, если указано
        if (request.getDepartment() != null) {
            List<UUID> departmentEmployeeIds = employeeRepository.findByDepartment(request.getDepartment())
                    .stream()
                    .map(Employee::getId)
                    .collect(Collectors.toList());
            
            violations = violations.stream()
                    .filter(v -> {
                        Object empIdObj = v.get("employeeId");
                        if (empIdObj == null) return false;
                        UUID empId = UUID.fromString(empIdObj.toString());
                        return departmentEmployeeIds.contains(empId);
                    })
                    .collect(Collectors.toList());
        }

        // Преобразуем в DTO
        List<ViolationHistoryResponse.ViolationRecord> violationRecords = violations.stream()
                .map(this::toViolationRecord)
                .collect(Collectors.toList());

        response.setViolations(violationRecords);

        // Формируем сводку
        ViolationHistoryResponse.Summary summary = new ViolationHistoryResponse.Summary();
        summary.setTotalViolations((long) violationRecords.size());
        
        // Группировка по типам
        Map<String, Long> byType = violationRecords.stream()
                .collect(Collectors.groupingBy(
                        ViolationHistoryResponse.ViolationRecord::getViolationType,
                        Collectors.counting()
                ));
        summary.setByType(byType);
        
        // Группировка по подразделениям
        Map<String, Long> byDepartment = new HashMap<>();
        Set<UUID> uniqueEmployees = violationRecords.stream()
                .map(ViolationHistoryResponse.ViolationRecord::getEmployeeId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        
        // Группируем по подразделениям
        for (UUID empId : uniqueEmployees) {
            Employee emp = employeeRepository.findById(empId).orElse(null);
            if (emp != null && emp.getDepartment() != null) {
                byDepartment.merge(emp.getDepartment(), 1L, Long::sum);
            }
        }
        summary.setByDepartment(byDepartment);
        summary.setEmployeesWithViolations((long) uniqueEmployees.size());
        response.setSummary(summary);

        return response;
    }

    private ViolationHistoryResponse.ViolationRecord toViolationRecord(Map<String, Object> violation) {
        ViolationHistoryResponse.ViolationRecord record = new ViolationHistoryResponse.ViolationRecord();
        
        Object idObj = violation.get("id");
        Object empIdObj = violation.get("employeeId");
        
        if (idObj instanceof UUID) {
            record.setId((UUID) idObj);
        } else {
            record.setId(UUID.fromString(idObj.toString()));
        }
        
        UUID employeeId;
        if (empIdObj instanceof UUID) {
            employeeId = (UUID) empIdObj;
            record.setEmployeeId(employeeId);
        } else {
            employeeId = UUID.fromString(empIdObj.toString());
            record.setEmployeeId(employeeId);
        }
        
        // Получаем имя сотрудника из базы
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee != null) {
            record.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        } else {
            record.setEmployeeName("Unknown");
        }
        
        record.setViolationType(violation.get("type").toString());
        record.setDescription(violation.get("description") != null ? violation.get("description").toString() : "");
        record.setOccurredAt(parseDateTime(violation.get("occurredAt")));
        record.setStatus(violation.get("status").toString());
        
        // Определяем severity на основе типа
        String type = record.getViolationType();
        if (type.contains("LATE") || type.contains("ABSENCE")) {
            record.setSeverity("LOW");
        } else if (type.contains("MISCONDUCT") || type.contains("VIOLATION")) {
            record.setSeverity("MEDIUM");
        } else {
            record.setSeverity("HIGH");
        }
        
        return record;
    }

    private OffsetDateTime parseDateTime(Object dateTimeObj) {
        if (dateTimeObj instanceof String) {
            return OffsetDateTime.parse((String) dateTimeObj);
        } else if (dateTimeObj instanceof OffsetDateTime) {
            return (OffsetDateTime) dateTimeObj;
        }
        return OffsetDateTime.now();
    }
}

