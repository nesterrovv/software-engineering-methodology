package com.casino.mis.finance.controller;

import com.casino.mis.finance.domain.FinancialReport;
import com.casino.mis.finance.dto.FinancialReportRequest;
import com.casino.mis.finance.dto.FinancialReportResponse;
import com.casino.mis.finance.service.FinancialReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
}

