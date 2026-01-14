package com.casino.finance.service;

import com.casino.finance.domain.CashOperation;
import com.casino.finance.domain.Report;
import com.casino.finance.dto.ReportRequest;
import com.casino.finance.repository.CashOperationRepository;
import com.casino.finance.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepo;
    private final CashOperationRepository opRepo;
    private final S3Client s3;

    private static final String BUCKET = "reports";

    public ReportService(ReportRepository reportRepo,
                         CashOperationRepository opRepo,
                         S3Client s3) {
        this.reportRepo = reportRepo;
        this.opRepo = opRepo;
        this.s3 = s3;
    }

    @Transactional
    public Report generateCsvReport(ReportRequest req) {
        // Период в LocalDate → OffsetDateTime
        OffsetDateTime from = req.getPeriodStart()
                .atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime to = req.getPeriodEnd()
                .atTime(23,59,59).atOffset(ZoneOffset.UTC);

        // Находим операции
        List<CashOperation> ops = opRepo.findByOperatedAtBetween(from, to);

        // Собираем CSV
        String header = "id,cashDeskId,amount,type,currency,operatedAt";
        String body = ops.stream()
                .map(o -> String.join(",",
                        o.getId().toString(),
                        o.getCashDeskId().toString(),
                        o.getAmount().toString(),
                        o.getType().name(),
                        o.getCurrency(),
                        o.getOperatedAt().toString()
                ))
                .collect(Collectors.joining("\n"));

        String csv = header + "\n" + body + "\n";
        String key = "report-" + UUID.randomUUID() + ".csv";
        // Отправляем в S3
        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(BUCKET)
                        .key(key)
                        .build(),
                software.amazon.awssdk.core.sync.RequestBody
                        .fromBytes(csv.getBytes(StandardCharsets.UTF_8))
        );
        // Сохраняем мета
        Report report = new Report();
        report.setPeriodStart(req.getPeriodStart());
        report.setPeriodEnd(req.getPeriodEnd());
        report.setCsvUrl("s3://" + BUCKET + "/" + key);
        return reportRepo.save(report);
    }

    public byte[] downloadReport(UUID reportId) {
        Report report = reportRepo.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        if (report.getCsvUrl() == null || report.getCsvUrl().isEmpty()) {
            throw new RuntimeException("Report CSV URL is not set");
        }

        // Извлекаем ключ из URL формата s3://bucket/key
        String csvUrl = report.getCsvUrl();
        if (!csvUrl.startsWith("s3://" + BUCKET + "/")) {
            throw new RuntimeException("Invalid CSV URL format: " + csvUrl);
        }
        String key = csvUrl.substring(("s3://" + BUCKET + "/").length());

        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(key)
                    .build();

            ResponseInputStream<GetObjectResponse> response = s3.getObject(getObjectRequest);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = response.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            response.close();
            return outputStream.toByteArray();
        } catch (NoSuchKeyException e) {
            throw new RuntimeException("Report file not found in storage: " + key, e);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read report file from storage", e);
        }
    }

}
