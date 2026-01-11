package com.casino.mis.finance.service;

import com.casino.mis.finance.domain.AnomalousTransaction;
import com.casino.mis.finance.domain.CashOperation;
import com.casino.mis.finance.dto.AnomalyDetectionRequest;
import com.casino.mis.finance.repository.AnomalousTransactionRepository;
import com.casino.mis.finance.repository.CashOperationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnomalyDetectionService {

    private final AnomalousTransactionRepository anomalyRepo;
    private final CashOperationRepository operationRepo;

    public AnomalyDetectionService(AnomalousTransactionRepository anomalyRepo,
                                  CashOperationRepository operationRepo) {
        this.anomalyRepo = anomalyRepo;
        this.operationRepo = operationRepo;
    }

    // UC12: Выявление аномальных транзакций
    @Transactional
    public List<AnomalousTransaction> detectAnomalies(AnomalyDetectionRequest request) {
        OffsetDateTime start = request.getPeriodStart() != null ? 
                request.getPeriodStart() : OffsetDateTime.now().minusDays(7);
        OffsetDateTime end = request.getPeriodEnd() != null ? 
                request.getPeriodEnd() : OffsetDateTime.now();

        List<CashOperation> operations = operationRepo.findByOperatedAtBetween(start, end);
        List<AnomalousTransaction> anomalies = new ArrayList<>();

        // Проверка на крупные суммы
        BigDecimal largeAmountThreshold = request.getLargeAmountThreshold() != null ?
                request.getLargeAmountThreshold() : new BigDecimal("10000");
        
        for (CashOperation op : operations) {
            if (op.getAmount().abs().compareTo(largeAmountThreshold) > 0) {
                // Проверяем, не была ли уже добавлена аномалия для этой операции
                boolean alreadyExists = anomalies.stream()
                        .anyMatch(a -> a.getCashOperationId().equals(op.getId()));
                if (!alreadyExists) {
                    AnomalousTransaction anomaly = createAnomaly(
                            op,
                            AnomalousTransaction.AnomalyType.LARGE_AMOUNT,
                            "Amount " + op.getAmount() + " exceeds threshold: " + largeAmountThreshold,
                            calculateRiskLevel(op.getAmount().abs(), largeAmountThreshold)
                    );
                    anomalies.add(anomaly);
                }
            }
        }

        // Проверка на частоту транзакций
        Integer frequencyThreshold = request.getFrequencyThreshold() != null ?
                request.getFrequencyThreshold() : 10;
        Long timeWindowMinutes = request.getTimeWindowMinutes() != null ?
                request.getTimeWindowMinutes() : 60L;

        Map<UUID, List<CashOperation>> operationsByDesk = operations.stream()
                .collect(Collectors.groupingBy(CashOperation::getCashDeskId));

        for (Map.Entry<UUID, List<CashOperation>> entry : operationsByDesk.entrySet()) {
            List<CashOperation> deskOps = entry.getValue();
            if (deskOps.size() >= frequencyThreshold) {
                // Проверяем частоту в окне времени
                for (int i = 0; i < deskOps.size() - frequencyThreshold + 1; i++) {
                    CashOperation first = deskOps.get(i);
                    CashOperation last = deskOps.get(Math.min(i + frequencyThreshold - 1, deskOps.size() - 1));
                    
                    long minutesBetween = java.time.Duration.between(
                            first.getOperatedAt(), 
                            last.getOperatedAt()
                    ).toMinutes();

                    if (minutesBetween <= timeWindowMinutes) {
                        AnomalousTransaction anomaly = createAnomaly(
                                first,
                                AnomalousTransaction.AnomalyType.HIGH_FREQUENCY,
                                "High frequency detected: " + frequencyThreshold + 
                                        " transactions in " + minutesBetween + " minutes",
                                AnomalousTransaction.RiskLevel.MEDIUM
                        );
                        anomalies.add(anomaly);
                        break; // Одна аномалия на кассу достаточно
                    }
                }
            }
        }

        // Сохраняем все обнаруженные аномалии
        return anomalyRepo.saveAll(anomalies);
    }

    private AnomalousTransaction createAnomaly(CashOperation op, 
                                               AnomalousTransaction.AnomalyType type,
                                               String reason,
                                               AnomalousTransaction.RiskLevel riskLevel) {
        AnomalousTransaction anomaly = new AnomalousTransaction();
        anomaly.setCashOperationId(op.getId());
        anomaly.setType(type);
        anomaly.setRiskLevel(riskLevel);
        anomaly.setReason(reason);
        anomaly.setAmount(op.getAmount());
        anomaly.setStatus(AnomalousTransaction.AnomalyStatus.DETECTED);
        return anomaly;
    }

    private AnomalousTransaction.RiskLevel calculateRiskLevel(BigDecimal amount, BigDecimal threshold) {
        BigDecimal ratio = amount.divide(threshold, 2, java.math.RoundingMode.HALF_UP);
        if (ratio.compareTo(new BigDecimal("5")) >= 0) {
            return AnomalousTransaction.RiskLevel.CRITICAL;
        } else if (ratio.compareTo(new BigDecimal("2")) >= 0) {
            return AnomalousTransaction.RiskLevel.HIGH;
        } else {
            return AnomalousTransaction.RiskLevel.MEDIUM;
        }
    }

    public List<AnomalousTransaction> findAll() {
        return anomalyRepo.findAll();
    }

    public AnomalousTransaction findById(UUID id) {
        return anomalyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Anomalous transaction not found: " + id));
    }

    @Transactional
    public AnomalousTransaction reviewAnomaly(UUID id, AnomalousTransaction.AnomalyStatus status, 
                                             UUID reviewerId, String notes) {
        AnomalousTransaction anomaly = findById(id);
        anomaly.setStatus(status);
        anomaly.setReviewedBy(reviewerId);
        anomaly.setReviewedAt(OffsetDateTime.now());
        anomaly.setReviewerNotes(notes);
        return anomalyRepo.save(anomaly);
    }
}

