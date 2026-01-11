package com.casino.incident.controller;

import com.casino.incident.domain.ReportType;
import com.casino.incident.dto.*;
import com.casino.incident.mapper.ReportMapper;
import com.casino.incident.service.ExportService;
import com.casino.incident.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;
    private final ExportService exportService;

    public ReportController(ReportService reportService, ExportService exportService) {
        this.reportService = reportService;
        this.exportService = exportService;
    }

    // UC14: Формирование отчётов по инцидентам
    @PostMapping("/incidents")
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse generateIncidentReport(@RequestBody @Valid IncidentReportRequest request) {
        return ReportMapper.toDto(reportService.generateIncidentReport(request));
    }

    // UC17: Генерация отчётов для руководства
    @PostMapping("/management")
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse generateManagementReport(@RequestBody @Valid ManagementReportRequest request) {
        return ReportMapper.toDto(reportService.generateManagementReport(request));
    }

    // UC18: Генерация отчётов для регуляторов
    @PostMapping("/regulatory")
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse generateRegulatoryReport(@RequestBody @Valid RegulatoryReportRequest request) {
        return ReportMapper.toDto(reportService.generateRegulatoryReport(request));
    }

    // UC16: Повторяющиеся нарушения сотрудников
    @PostMapping("/repeated-violations")
    public RepeatedViolationsResponse getRepeatedViolations(@RequestBody @Valid RepeatedViolationsRequest request) {
        return reportService.getRepeatedViolations(request);
    }

    @GetMapping
    public List<ReportResponse> getAll(@RequestParam(required = false) ReportType type) {
        if (type != null) {
            return ReportMapper.toDtoList(reportService.findByType(type));
        }
        return ReportMapper.toDtoList(reportService.findAll());
    }

    @GetMapping("/{id}")
    public ReportResponse getById(@PathVariable UUID id) {
        return ReportMapper.toDto(reportService.findById(id));
    }

    // UC19: Экспорт в PDF
    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportToPdf(@PathVariable UUID id) throws IOException {
        return exportService.exportToPdf(id);
    }

    // UC19: Экспорт в Excel
    @GetMapping("/{id}/export/excel")
    public ResponseEntity<byte[]> exportToExcel(@PathVariable UUID id) throws IOException {
        return exportService.exportToExcel(id);
    }
}

