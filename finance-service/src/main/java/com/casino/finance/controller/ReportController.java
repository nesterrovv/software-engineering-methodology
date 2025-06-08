package com.casino.finance.controller;

import com.casino.finance.domain.Report;
import com.casino.finance.dto.ReportRequest;
import com.casino.finance.dto.ReportResponse;
import com.casino.finance.service.ReportService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse generate(@RequestBody ReportRequest req) {
        Report report = service.generateCsvReport(req);
        return new ReportResponse(
                report.getId(),
                report.getPeriodStart(),
                report.getPeriodEnd(),
                report.getCsvUrl()
        );
    }
}
