package com.casino.mis.finance.controller;

import com.casino.mis.finance.domain.FinancialReport;
import com.casino.mis.finance.dto.FinancialReportRequest;
import com.casino.mis.finance.dto.FinancialReportResponse;
import com.casino.mis.finance.service.FinancialReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/finance/reports")
@Tag(name = "Financial Reports", description = "UC10: Формирование финансовых отчётов")
public class FinancialReportController {

    private final FinancialReportService service;

    public FinancialReportController(FinancialReportService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать финансовый отчёт", description = "UC10: Генерация CSV отчёта по финансовым операциям за период. Отчёт сохраняется в S3.")
    public FinancialReportResponse generate(@RequestBody @jakarta.validation.Valid FinancialReportRequest req) {
        FinancialReport report = service.generateCsvReport(req);
        return new FinancialReportResponse(
                report.getId(),
                report.getPeriodStart(),
                report.getPeriodEnd(),
                report.getCsvUrl()
        );
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Скачать финансовый отчёт", description = "Скачивание CSV отчёта из MinIO по идентификатору отчёта")
    public ResponseEntity<byte[]> downloadReport(@PathVariable UUID id) {
        byte[] reportBytes = service.downloadReport(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "report_" + id + ".csv");
        headers.setContentLength(reportBytes.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(reportBytes);
    }
}

