package com.casino.finance.service;

import com.casino.finance.domain.CashOperation;
import com.casino.finance.domain.Report;
import com.casino.finance.dto.ReportRequest;
import com.casino.finance.repository.CashOperationRepository;
import com.casino.finance.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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

}
