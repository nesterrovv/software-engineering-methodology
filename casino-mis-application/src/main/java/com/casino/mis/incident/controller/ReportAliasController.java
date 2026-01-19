package com.casino.mis.incident.controller;

import com.casino.mis.incident.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

/**
 * Альтернативный контроллер для обратной совместимости
 * Поддерживает старый URL: /api/incidents/report/{id}/export/pdf
 */
@RestController
@RequestMapping("/api/incidents/report")
@Tag(name = "Report Aliases", description = "Альтернативные URL для обратной совместимости")
public class ReportAliasController {

    private final ExportService exportService;

    public ReportAliasController(ExportService exportService) {
        this.exportService = exportService;
    }

    // Альтернативный путь для PDF экспорта
    @GetMapping("/{id}/export/pdf")
    @Operation(summary = "Экспорт отчёта в PDF (альтернативный URL)", 
               description = "Альтернативный URL для обратной совместимости. Используйте /api/incident/reports/{id}/export/pdf")
    public ResponseEntity<byte[]> exportToPdf(@PathVariable UUID id) throws IOException {
        return exportService.exportToPdf(id);
    }

    // Альтернативный путь для Excel экспорта
    @GetMapping("/{id}/export/excel")
    @Operation(summary = "Экспорт отчёта в Excel (альтернативный URL)", 
               description = "Альтернативный URL для обратной совместимости. Используйте /api/incident/reports/{id}/export/excel")
    public ResponseEntity<byte[]> exportToExcel(@PathVariable UUID id) throws IOException {
        return exportService.exportToExcel(id);
    }
}
