package com.casino.mis.incident.service;

import com.casino.mis.incident.domain.Report;
import com.casino.mis.incident.repository.ReportRepository;
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
            
            // HTML заголовок с CSS стилями
            html.append("<!DOCTYPE html>");
            html.append("<html><head>");
            html.append("<meta charset='UTF-8'/>");
            html.append("<title>Report</title>");
            html.append("<style>");
            html.append("body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }");
            html.append("h1 { color: #333; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; }");
            html.append("h2 { color: #555; font-size: 18px; margin-top: 20px; }");
            html.append(".info { background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }");
            html.append(".info p { margin: 5px 0; }");
            html.append("table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }");
            html.append("th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; }");
            html.append("td { padding: 8px; border-bottom: 1px solid #ddd; }");
            html.append("tr:hover { background-color: #f5f5f5; }");
            html.append(".summary { display: inline-block; margin-right: 20px; padding: 10px; background-color: #e3f2fd; border-radius: 5px; }");
            html.append(".label { font-weight: bold; color: #555; }");
            html.append("</style>");
            html.append("</head><body>");
            
            // Заголовок отчета
            html.append("<h1>Report: ").append(report.getType().name()).append("</h1>");
            
            // Информация о периоде
            html.append("<div class='info'>");
            html.append("<p><span class='label'>Period:</span> ")
                .append(report.getPeriodStart()).append(" - ").append(report.getPeriodEnd()).append("</p>");
            html.append("<p><span class='label'>Generated:</span> ").append(report.getGeneratedAt()).append("</p>");
            html.append("<p><span class='label'>Report ID:</span> ").append(report.getId()).append("</p>");
            html.append("</div>");
            
            // Сводная статистика
            html.append("<h2>Summary</h2>");
            html.append("<div>");
            if (reportData.containsKey("totalIncidents")) {
                html.append("<div class='summary'>");
                html.append("<span class='label'>Total Incidents:</span> ").append(reportData.get("totalIncidents"));
                html.append("</div>");
            }
            html.append("</div>");
            
            // Инциденты по типам
            if (reportData.containsKey("incidentsByType")) {
                html.append("<h2>Incidents by Type</h2>");
                html.append("<table>");
                html.append("<tr><th>Type</th><th>Count</th></tr>");
                @SuppressWarnings("unchecked")
                Map<String, Object> incidentsByType = (Map<String, Object>) reportData.get("incidentsByType");
                for (Map.Entry<String, Object> entry : incidentsByType.entrySet()) {
                    html.append("<tr>");
                    html.append("<td>").append(entry.getKey()).append("</td>");
                    html.append("<td>").append(entry.getValue()).append("</td>");
                    html.append("</tr>");
                }
                html.append("</table>");
            }
            
            // Жалобы по категориям
            if (reportData.containsKey("complaintsByCategory")) {
                html.append("<h2>Complaints by Category</h2>");
                html.append("<table>");
                html.append("<tr><th>Category</th><th>Count</th></tr>");
                @SuppressWarnings("unchecked")
                Map<String, Object> complaintsByCategory = (Map<String, Object>) reportData.get("complaintsByCategory");
                for (Map.Entry<String, Object> entry : complaintsByCategory.entrySet()) {
                    html.append("<tr>");
                    html.append("<td>").append(entry.getKey()).append("</td>");
                    html.append("<td>").append(entry.getValue()).append("</td>");
                    html.append("</tr>");
                }
                html.append("</table>");
            }
            
            // Список инцидентов
            if (reportData.containsKey("incidents")) {
                html.append("<h2>Incidents Details</h2>");
                html.append("<table>");
                html.append("<tr><th>ID</th><th>Type</th><th>Description</th><th>Location</th><th>Status</th></tr>");
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> incidents = (java.util.List<Map<String, Object>>) reportData.get("incidents");
                for (Map<String, Object> incident : incidents) {
                    html.append("<tr>");
                    html.append("<td>").append(incident.getOrDefault("id", "N/A").toString().substring(0, 8)).append("...</td>");
                    html.append("<td>").append(incident.getOrDefault("type", "N/A")).append("</td>");
                    String description = incident.getOrDefault("description", "N/A").toString();
                    if (description.length() > 50) {
                        description = description.substring(0, 47) + "...";
                    }
                    html.append("<td>").append(description).append("</td>");
                    html.append("<td>").append(incident.getOrDefault("location", "N/A")).append("</td>");
                    html.append("<td>").append(incident.getOrDefault("status", "N/A")).append("</td>");
                    html.append("</tr>");
                }
                html.append("</table>");
            }
            
            html.append("</body></html>");
            return html.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HTML report", e);
        }
    }
}

