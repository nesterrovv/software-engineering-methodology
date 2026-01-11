package com.casino.mis.security.service;

import com.casino.mis.security.domain.FraudCheckResult;
import com.casino.mis.security.domain.FraudDatabase;
import com.casino.mis.security.dto.FraudCheckRequest;
import com.casino.mis.security.dto.FraudCheckResponse;
import com.casino.mis.security.repository.FraudCheckResultRepository;
import com.casino.mis.security.repository.FraudDatabaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FraudCheckService {

    private final FraudDatabaseRepository fraudRepository;
    private final FraudCheckResultRepository checkResultRepository;
    private final NotificationService notificationService;

    public FraudCheckService(FraudDatabaseRepository fraudRepository,
                            FraudCheckResultRepository checkResultRepository,
                            NotificationService notificationService) {
        this.fraudRepository = fraudRepository;
        this.checkResultRepository = checkResultRepository;
        this.notificationService = notificationService;
    }

    // UC6: Сверка с базой мошенников
    @Transactional
    public FraudCheckResponse checkPerson(String personId, UUID triggeredByActivityId) {
        FraudCheckRequest request = new FraudCheckRequest();
        request.setPersonId(personId);
        request.setTriggeredByActivityId(triggeredByActivityId);
        return performCheck(request);
    }

    @Transactional
    public FraudCheckResponse performCheck(FraudCheckRequest request) {
        FraudCheckResponse response = new FraudCheckResponse();
        List<FraudCheckResponse.MatchResult> matches = new ArrayList<>();

        // Поиск по personId
        Optional<FraudDatabase> exactMatch = fraudRepository.findByPersonId(request.getPersonId());
        if (exactMatch.isPresent() && exactMatch.get().getStatus() == FraudDatabase.FraudStatus.ACTIVE) {
            FraudCheckResult checkResult = createCheckResult(exactMatch.get(), request, 100.0, FraudCheckResult.MatchConfidence.VERY_HIGH);
            matches.add(toMatchResult(checkResult));
        }

        // Поиск по имени (если есть)
        if (request.getPersonId().matches("[A-Za-z]+.*")) {
            List<FraudDatabase> nameMatches = fraudRepository.search(request.getPersonId());
            for (FraudDatabase fraud : nameMatches) {
                if (fraud.getStatus() == FraudDatabase.FraudStatus.ACTIVE) {
                    double similarity = calculateNameSimilarity(request.getPersonId(), fraud.getFullName());
                    if (similarity > 70.0) {
                        FraudCheckResult checkResult = createCheckResult(fraud, request, similarity, 
                                similarity > 90 ? FraudCheckResult.MatchConfidence.HIGH : 
                                similarity > 80 ? FraudCheckResult.MatchConfidence.MEDIUM : 
                                FraudCheckResult.MatchConfidence.LOW);
                        matches.add(toMatchResult(checkResult));
                    }
                }
            }
        }

        response.setMatchFound(!matches.isEmpty());
        response.setMatches(matches);

        // UC7: Если найдено совпадение - отправляем уведомление
        if (!matches.isEmpty()) {
            for (FraudCheckResponse.MatchResult match : matches) {
                notificationService.createNotification(
                        UUID.randomUUID(), // ID сотрудника службы безопасности
                        com.casino.mis.security.domain.Notification.NotificationType.FRAUD_MATCH,
                        "Совпадение с базой мошенников",
                        "Лицо " + request.getPersonId() + " найдено в базе мошенников: " + match.getFraudRecordName(),
                        com.casino.mis.security.domain.Notification.NotificationPriority.CRITICAL,
                        "FRAUD_CHECK",
                        match.getCheckResultId()
                );

                // Обновляем счётчик совпадений
                FraudDatabase fraud = fraudRepository.findById(match.getFraudRecordId())
                        .orElseThrow();
                fraud.setMatchCount(fraud.getMatchCount() + 1);
                fraud.setLastCheckedAt(OffsetDateTime.now());
                fraudRepository.save(fraud);
            }
        }

        return response;
    }

    private FraudCheckResult createCheckResult(FraudDatabase fraud, FraudCheckRequest request, 
                                              Double similarity, FraudCheckResult.MatchConfidence confidence) {
        FraudCheckResult result = new FraudCheckResult();
        result.setFraudRecordId(fraud.getId());
        result.setCheckedPersonId(request.getPersonId());
        result.setCheckedAt(OffsetDateTime.now());
        result.setSimilarityScore(similarity);
        result.setConfidence(confidence);
        result.setMatchDetails("Совпадение: " + fraud.getFraudType() + " - " + fraud.getDescription());
        result.setTriggeredByActivityId(request.getTriggeredByActivityId());
        result.setStatus(FraudCheckResult.CheckStatus.MATCH_FOUND);
        return checkResultRepository.save(result);
    }

    private FraudCheckResponse.MatchResult toMatchResult(FraudCheckResult checkResult) {
        FraudDatabase fraud = fraudRepository.findById(checkResult.getFraudRecordId())
                .orElseThrow();
        return new FraudCheckResponse.MatchResult(
                checkResult.getId(),
                checkResult.getFraudRecordId(),
                fraud.getFullName(),
                checkResult.getConfidence(),
                checkResult.getSimilarityScore(),
                checkResult.getMatchDetails(),
                checkResult.getCheckedAt()
        );
    }

    private double calculateNameSimilarity(String name1, String name2) {
        // Простой алгоритм схожести имён (Levenshtein distance упрощённо)
        if (name1 == null || name2 == null) return 0.0;
        String s1 = name1.toLowerCase();
        String s2 = name2.toLowerCase();
        if (s1.equals(s2)) return 100.0;
        if (s1.contains(s2) || s2.contains(s1)) return 85.0;
        
        // Простая проверка на общие слова
        String[] words1 = s1.split("\\s+");
        String[] words2 = s2.split("\\s+");
        int commonWords = 0;
        for (String w1 : words1) {
            for (String w2 : words2) {
                if (w1.equals(w2) || w1.contains(w2) || w2.contains(w1)) {
                    commonWords++;
                }
            }
        }
        return Math.min(100.0, (double) commonWords / Math.max(words1.length, words2.length) * 100);
    }
}


