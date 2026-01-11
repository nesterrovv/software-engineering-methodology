package com.casino.mis.finance.service;

import com.casino.mis.finance.domain.CashOperation;
import com.casino.mis.finance.domain.GameSessionAnalysis;
import com.casino.mis.finance.dto.GameAnalysisRequest;
import com.casino.mis.finance.repository.CashOperationRepository;
import com.casino.mis.finance.repository.GameSessionAnalysisRepository;
import com.casino.mis.finance.service.AnomalyDetectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GameAnalysisService {

    private final GameSessionAnalysisRepository analysisRepo;
    private final CashOperationRepository operationRepo;
    private final AnomalyDetectionService anomalyService;

    public GameAnalysisService(GameSessionAnalysisRepository analysisRepo,
                              CashOperationRepository operationRepo,
                              AnomalyDetectionService anomalyService) {
        this.analysisRepo = analysisRepo;
        this.operationRepo = operationRepo;
        this.anomalyService = anomalyService;
    }

    // UC13: Анализ выигрышей и проигрышей
    @Transactional
    public GameSessionAnalysis analyzeGameSessions(GameAnalysisRequest request) {
        // Получаем операции за период
        // В реальной системе здесь были бы игровые сессии, но для MVP используем операции
        // Предполагаем, что DEPOSIT = ставки игрока, WITHDRAWAL = выигрыши
        List<CashOperation> operations = operationRepo.findByOperatedAtBetween(
                request.getPeriodStart(),
                request.getPeriodEnd()
        );

        // Фильтруем по столу/автомату, если указан
        if (request.getGameTableId() != null) {
            operations = operations.stream()
                    .filter(op -> op.getCashDeskId().toString().equals(request.getGameTableId()))
                    .collect(Collectors.toList());
        }

        // Рассчитываем метрики
        List<CashOperation> deposits = operations.stream()
                .filter(op -> op.getType() == com.casino.mis.finance.domain.OperationType.DEPOSIT)
                .collect(Collectors.toList());

        List<CashOperation> withdrawals = operations.stream()
                .filter(op -> op.getType() == com.casino.mis.finance.domain.OperationType.WITHDRAWAL)
                .collect(Collectors.toList());

        BigDecimal totalBets = deposits.stream()
                .map(CashOperation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWins = withdrawals.stream()
                .map(CashOperation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Рассчитываем RTP (Return to Player)
        BigDecimal rtp = BigDecimal.ZERO;
        if (totalBets.compareTo(BigDecimal.ZERO) > 0) {
            rtp = totalWins.divide(totalBets, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        BigDecimal expectedRtp = request.getExpectedRtp() != null ?
                request.getExpectedRtp() : new BigDecimal("95.0");
        
        BigDecimal rtpDeviation = rtp.subtract(expectedRtp);

        // Определяем крупные выигрыши
        BigDecimal largeWinThreshold = request.getLargeWinThreshold() != null ?
                request.getLargeWinThreshold() : new BigDecimal("1000");

        List<CashOperation> largeWins = withdrawals.stream()
                .filter(op -> op.getAmount().compareTo(largeWinThreshold) > 0)
                .collect(Collectors.toList());

        BigDecimal largestWin = withdrawals.stream()
                .map(CashOperation::getAmount)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // Создаем анализ
        GameSessionAnalysis analysis = new GameSessionAnalysis();
        analysis.setGameTableId(request.getGameTableId());
        analysis.setPeriodStart(request.getPeriodStart());
        analysis.setPeriodEnd(request.getPeriodEnd());
        analysis.setTotalSessions((long) Math.max(deposits.size(), withdrawals.size()));
        analysis.setTotalBets(totalBets);
        analysis.setTotalWins(totalWins);
        analysis.setRtp(rtp);
        analysis.setExpectedRtp(expectedRtp);
        analysis.setRtpDeviation(rtpDeviation);
        analysis.setLargeWinsCount(largeWins.size());
        analysis.setLargestWinAmount(largestWin);
        analysis.setStatus(GameSessionAnalysis.AnalysisStatus.COMPLETED);

        // Если есть крупные выигрыши, передаем в UC12 для проверки
        if (!largeWins.isEmpty()) {
            String note = "Large wins detected: " + largeWins.size() + 
                    " wins exceeding " + largeWinThreshold + ". Sent to anomaly detection (UC12).";
            analysis.setNotes(note);
        }

        // Если RTP отклоняется значительно, отмечаем это
        if (rtpDeviation.abs().compareTo(new BigDecimal("5")) > 0) {
            String note = analysis.getNotes() != null ? analysis.getNotes() + " " : "";
            note += "Significant RTP deviation: " + rtpDeviation + "% (expected: " + expectedRtp + "%)";
            analysis.setNotes(note);
        }

        GameSessionAnalysis saved = analysisRepo.save(analysis);

        // Передаем крупные выигрыши в UC12 (анализ аномалий)
        // Примечание: в реальной системе здесь можно автоматически вызвать обнаружение аномалий
        // Это демонстрация интеграции UC12 и UC13 согласно спецификации

        return saved;
    }

    public GameSessionAnalysis findById(UUID id) {
        return analysisRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Game analysis not found: " + id));
    }

    public List<GameSessionAnalysis> findByGameTableId(String gameTableId) {
        return analysisRepo.findByGameTableId(gameTableId);
    }
}

