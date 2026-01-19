package com.casino.mis.incident.service;

import com.casino.mis.incident.domain.*;
import com.casino.mis.incident.dto.*;
import com.casino.mis.incident.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private static final String FIELD_PERIOD_START = "periodStart";
    private static final String FIELD_PERIOD_END = "periodEnd";

    private final ReportRepository reportRepository;
    private final IncidentRepository incidentRepository;
    private final ComplaintRepository complaintRepository;
    private final DisciplinaryViolationRepository violationRepository;
    private final ObjectMapper objectMapper;

    public ReportService(ReportRepository reportRepository,
                        IncidentRepository incidentRepository,
                        ComplaintRepository complaintRepository,
                        DisciplinaryViolationRepository violationRepository,
                        ObjectMapper objectMapper) {
        this.reportRepository = reportRepository;
        this.incidentRepository = incidentRepository;
        this.complaintRepository = complaintRepository;
        this.violationRepository = violationRepository;
        this.objectMapper = objectMapper;
    }

    // UC14: Формирование отчётов по инцидентам
    @Transactional
    public Report generateIncidentReport(IncidentReportRequest request) {
        OffsetDateTime start = request.getPeriodStart() != null ? request.getPeriodStart() : OffsetDateTime.now().minusMonths(1);
        OffsetDateTime end = request.getPeriodEnd() != null ? request.getPeriodEnd() : OffsetDateTime.now();

        List<Incident> incidents;
        if (request.getIncidentTypes() != null && !request.getIncidentTypes().isEmpty()) {
            incidents = request.getIncidentTypes().stream()
                    .flatMap(type -> incidentRepository.findByOccurredAtBetweenAndType(start, end, type).stream())
                    .collect(Collectors.toList());
        } else {
            incidents = incidentRepository.findByOccurredAtBetween(start, end);
        }

        // Получаем жалобы за тот же период (UC15)
        List<Complaint> complaints = complaintRepository.findByReportedAtBetween(start, end);

        Map<String, Object> reportData = new HashMap<>();
        reportData.put(FIELD_PERIOD_START, start.toString());
        reportData.put(FIELD_PERIOD_END, end.toString());
        reportData.put("totalIncidents", incidents.size());
        reportData.put("totalComplaints", complaints.size());
        reportData.put("incidentsByType", incidents.stream()
                .collect(Collectors.groupingBy(i -> i.getType().name(), Collectors.counting())));
        reportData.put("incidents", incidents.stream()
                .map(i -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", i.getId().toString());
                    map.put("type", i.getType().name());
                    map.put("location", i.getLocation() != null ? i.getLocation() : "");
                    map.put("occurredAt", i.getOccurredAt().toString());
                    return map;
                })
                .collect(Collectors.toList()));
        reportData.put("complaintsByCategory", complaints.stream()
                .collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting())));

        Report report = new Report();
        report.setType(ReportType.INCIDENTS);
        report.setPeriodStart(start);
        report.setPeriodEnd(end);
        report.setGeneratedAt(OffsetDateTime.now());
        report.setGeneratedBy(request.getGeneratedBy());

        try {
            report.setReportData(objectMapper.writeValueAsString(reportData));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize report data", e);
        }

        return reportRepository.save(report);
    }

    // UC17: Генерация отчётов для руководства
    @Transactional
    public Report generateManagementReport(ManagementReportRequest request) {
        OffsetDateTime start = request.getPeriodStart() != null ? request.getPeriodStart() : OffsetDateTime.now().minusMonths(1);
        OffsetDateTime end = request.getPeriodEnd() != null ? request.getPeriodEnd() : OffsetDateTime.now();

        List<Incident> incidents = incidentRepository.findByOccurredAtBetween(start, end);
        List<Complaint> complaints = complaintRepository.findByReportedAtBetween(start, end);
        List<DisciplinaryViolation> violations = violationRepository.findAll().stream()
                .filter(v -> v.getOccurredAt().isAfter(start) && v.getOccurredAt().isBefore(end))
                .collect(Collectors.toList());

        // UC16: Повторяющиеся нарушения сотрудников
        List<Object[]> repeatedViolations = violationRepository.findEmployeesWithRepeatedViolations(start, end, 3L);

        Map<String, Object> reportData = new HashMap<>();
        reportData.put(FIELD_PERIOD_START, start.toString());
        reportData.put(FIELD_PERIOD_END, end.toString());
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncidents", incidents.size());
        summary.put("totalComplaints", complaints.size());
        summary.put("totalViolations", violations.size());
        summary.put("employeesWithRepeatedViolations", repeatedViolations.size());
        reportData.put("summary", summary);
        
        Map<String, Object> incidentsSummary = new HashMap<>();
        incidentsSummary.put("byType", incidents.stream().collect(Collectors.groupingBy(i -> i.getType().name(), Collectors.counting())));
        incidentsSummary.put("byStatus", incidents.stream().collect(Collectors.groupingBy(i -> i.getStatus().name(), Collectors.counting())));
        reportData.put("incidentsSummary", incidentsSummary);
        
        Map<String, Object> complaintsSummary = new HashMap<>();
        complaintsSummary.put("byCategory", complaints.stream().collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting())));
        complaintsSummary.put("byStatus", complaints.stream().collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting())));
        reportData.put("complaintsSummary", complaintsSummary);
        
        Map<String, Object> violationsSummary = new HashMap<>();
        violationsSummary.put("byType", violations.stream().collect(Collectors.groupingBy(v -> v.getType().name(), Collectors.counting())));
        violationsSummary.put("byStatus", violations.stream().collect(Collectors.groupingBy(v -> v.getStatus().name(), Collectors.counting())));
        reportData.put("violationsSummary", violationsSummary);
        
        reportData.put("repeatedViolations", repeatedViolations.stream()
                .map(arr -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("employeeId", arr[0].toString());
                    map.put("count", arr[1]);
                    return map;
                })
                .collect(Collectors.toList()));

        Report report = new Report();
        report.setType(ReportType.MANAGEMENT);
        report.setPeriodStart(start);
        report.setPeriodEnd(end);
        report.setGeneratedAt(OffsetDateTime.now());
        report.setGeneratedBy(request.getGeneratedBy());

        try {
            report.setReportData(objectMapper.writeValueAsString(reportData));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize report data", e);
        }

        return reportRepository.save(report);
    }

    // UC18: Генерация отчётов для регуляторов
    @Transactional
    public Report generateRegulatoryReport(RegulatoryReportRequest request) {
        OffsetDateTime start = request.getPeriodStart() != null ? request.getPeriodStart() : OffsetDateTime.now().minusMonths(1);
        OffsetDateTime end = request.getPeriodEnd() != null ? request.getPeriodEnd() : OffsetDateTime.now();

        List<Incident> incidents = incidentRepository.findByOccurredAtBetween(start, end);
        List<Complaint> complaints = complaintRepository.findByReportedAtBetween(start, end);
        List<DisciplinaryViolation> violations = violationRepository.findAll().stream()
                .filter(v -> v.getOccurredAt().isAfter(start) && v.getOccurredAt().isBefore(end))
                .collect(Collectors.toList());

        // Для регуляторов нужна более детальная информация
        Map<String, Object> reportData = new HashMap<>();
        reportData.put(FIELD_PERIOD_START, start.toString());
        reportData.put(FIELD_PERIOD_END, end.toString());
        reportData.put("incidents", incidents.stream()
                .map(i -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", i.getId().toString());
                    map.put("type", i.getType().name());
                    map.put("location", i.getLocation() != null ? i.getLocation() : "");
                    map.put("occurredAt", i.getOccurredAt().toString());
                    map.put("status", i.getStatus().name());
                    map.put("description", i.getDescription() != null ? i.getDescription() : "");
                    return map;
                })
                .collect(Collectors.toList()));
        reportData.put("complaints", complaints.stream()
                .map(c -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", c.getId().toString());
                    map.put("category", c.getCategory().name());
                    map.put("reportedAt", c.getReportedAt().toString());
                    map.put("status", c.getStatus().name());
                    map.put("source", c.getSource().name());
                    return map;
                })
                .collect(Collectors.toList()));
        reportData.put("violations", violations.stream()
                .map(v -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", v.getId().toString());
                    map.put("employeeId", v.getEmployeeId().toString());
                    map.put("type", v.getType().name());
                    map.put("occurredAt", v.getOccurredAt().toString());
                    map.put("status", v.getStatus().name());
                    return map;
                })
                .collect(Collectors.toList()));

        Report report = new Report();
        report.setType(ReportType.REGULATORY);
        report.setPeriodStart(start);
        report.setPeriodEnd(end);
        report.setGeneratedAt(OffsetDateTime.now());
        report.setGeneratedBy(request.getGeneratedBy());

        try {
            report.setReportData(objectMapper.writeValueAsString(reportData));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize report data", e);
        }

        return reportRepository.save(report);
    }

    public Report findById(UUID id) {
        return reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Report> findByType(ReportType type) {
        return reportRepository.findByType(type);
    }
    
    public List<Report> findAll() {
        return reportRepository.findAll();
    }

    // UC16: Повторяющиеся нарушения сотрудников (отдельный метод)
    public RepeatedViolationsResponse getRepeatedViolations(RepeatedViolationsRequest request) {
        OffsetDateTime start = request.getPeriodStart() != null ? request.getPeriodStart() : OffsetDateTime.now().minusMonths(1);
        OffsetDateTime end = request.getPeriodEnd() != null ? request.getPeriodEnd() : OffsetDateTime.now();
        Long threshold = request.getThreshold() != null ? request.getThreshold() : 3L;

        List<Object[]> results = violationRepository.findEmployeesWithRepeatedViolations(start, end, threshold);

        List<RepeatedViolationsResponse.EmployeeViolationCount> employees = results.stream()
                .map(arr -> new RepeatedViolationsResponse.EmployeeViolationCount(
                        (UUID) arr[0],
                        (Long) arr[1]
                ))
                .collect(Collectors.toList());

        return new RepeatedViolationsResponse(employees);
    }
}

