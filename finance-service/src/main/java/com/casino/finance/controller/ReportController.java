package com.casino.finance.controller;

import com.casino.finance.domain.Report;
import com.casino.finance.dto.ReportRequest;
import com.casino.finance.dto.ReportResponse;
import com.casino.finance.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

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

    @GetMapping("/{id}/download")
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
