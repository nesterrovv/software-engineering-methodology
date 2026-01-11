package com.casino.mis.incident.controller;

import com.casino.mis.incident.domain.ReportType;
import com.casino.mis.incident.dto.*;
import com.casino.mis.incident.mapper.ReportMapper;
import com.casino.mis.incident.service.ExportService;
import com.casino.mis.incident.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incident/reports")
@Tag(name = "Incident Reports", description = "UC14, UC17, UC18, UC19: Отчёты по инцидентам, экспорт")
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
    @Operation(summary = "Создать отчёт по инцидентам", description = "UC14: Формирование отчёта, содержащего данные об инцидентах за период. Включает жалобы (UC15).")
    public ReportResponse generateIncidentReport(@RequestBody @Valid IncidentReportRequest request) {
        return ReportMapper.toDto(reportService.generateIncidentReport(request));
    }

    // UC17: Генерация отчётов для руководства
    @PostMapping("/management")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать отчёт для руководства", description = "UC17: Сводные отчёты для руководства с агрегированными данными по инцидентам, жалобам, нарушениям. Включает UC16 (повторяющиеся нарушения).")
    public ReportResponse generateManagementReport(@RequestBody @Valid ManagementReportRequest request) {
        return ReportMapper.toDto(reportService.generateManagementReport(request));
    }

    // UC18: Генерация отчётов для регуляторов
    @PostMapping("/regulatory")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать отчёт для регуляторов", description = "UC18: Отчёты для контролирующих органов с детальной информацией по всем инцидентам, жалобам и нарушениям.")
    public ReportResponse generateRegulatoryReport(@RequestBody @Valid RegulatoryReportRequest request) {
        return ReportMapper.toDto(reportService.generateRegulatoryReport(request));
    }

    // UC16: Повторяющиеся нарушения сотрудников
    @PostMapping("/repeated-violations")
    @Operation(summary = "Найти повторяющиеся нарушения", description = "UC16: Аналитика частоты дисциплинарных нарушений, выделение сотрудников с количеством нарушений >= порога.")
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
    @Operation(summary = "Экспорт отчёта в PDF", description = "UC19: Экспорт отчёта в формат PDF для загрузки или передачи.")
    public ResponseEntity<byte[]> exportToPdf(@PathVariable UUID id) throws IOException {
        return exportService.exportToPdf(id);
    }

    // UC19: Экспорт в Excel
    @GetMapping("/{id}/export/excel")
    @Operation(summary = "Экспорт отчёта в Excel", description = "UC19: Экспорт отчёта в формат Excel (XLSX) для дальнейшего анализа.")
    public ResponseEntity<byte[]> exportToExcel(@PathVariable UUID id) throws IOException {
        return exportService.exportToExcel(id);
    }
}

