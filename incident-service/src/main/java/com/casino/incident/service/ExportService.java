package com.casino.incident.service;

import com.casino.incident.domain.Report;
import com.casino.incident.repository.ReportRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class ExportService {

    private final ReportRepository reportRepository;
    private final ObjectMapper objectMapper;

    public ExportService(ReportRepository reportRepository, ObjectMapper objectMapper) {
        this.reportRepository = reportRepository;
        this.objectMapper = objectMapper;
    }

    // UC19: Экспорт в PDF
    public ResponseEntity<byte[]> exportToPdf(UUID reportId) throws IOException {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        // Простая реализация PDF с использованием iText
        String html = generateHtmlReport(report);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try {
            com.itextpdf.html2pdf.HtmlConverter.convertToPdf(html, outputStream);
        } catch (Exception e) {
            throw new IOException("Failed to convert HTML to PDF", e);
        }

        byte[] pdfBytes = outputStream.toByteArray();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "report_" + reportId + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    // UC19: Экспорт в Excel
    public ResponseEntity<byte[]> exportToExcel(UUID reportId) throws IOException {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Report");

        // Парсим JSON данные отчёта
        @SuppressWarnings("unchecked")
        Map<String, Object> reportData = objectMapper.readValue(report.getReportData(), Map.class);

        int rowNum = 0;
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Report ID");
        headerRow.createCell(1).setCellValue("Type");
        headerRow.createCell(2).setCellValue("Period Start");
        headerRow.createCell(3).setCellValue("Period End");
        headerRow.createCell(4).setCellValue("Generated At");

        Row dataRow = sheet.createRow(rowNum++);
        dataRow.createCell(0).setCellValue(report.getId().toString());
        dataRow.createCell(1).setCellValue(report.getType().name());
        dataRow.createCell(2).setCellValue(report.getPeriodStart().toString());
        dataRow.createCell(3).setCellValue(report.getPeriodEnd().toString());
        dataRow.createCell(4).setCellValue(report.getGeneratedAt().toString());

        // Добавляем данные из reportData
        rowNum = addReportDataToSheet(sheet, reportData, rowNum);

        // Автоподбор ширины колонок
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "report_" + reportId + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(outputStream.toByteArray());
    }

    private int addReportDataToSheet(Sheet sheet, Map<String, Object> data, int startRow) {
        int rowNum = startRow;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(entry.getValue().toString());
        }
        return rowNum;
    }

    private String generateHtmlReport(Report report) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> reportData = objectMapper.readValue(report.getReportData(), Map.class);
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Report</title></head><body>");
            html.append("<h1>Report: ").append(report.getType().name()).append("</h1>");
            html.append("<p>Period: ").append(report.getPeriodStart()).append(" - ").append(report.getPeriodEnd()).append("</p>");
            html.append("<pre>").append(reportData.toString()).append("</pre>");
            html.append("</body></html>");
            return html.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HTML report", e);
        }
    }
}

