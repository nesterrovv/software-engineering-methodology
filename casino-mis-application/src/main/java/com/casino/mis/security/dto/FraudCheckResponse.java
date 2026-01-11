package com.casino.mis.security.dto;

import com.casino.mis.security.domain.FraudCheckResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudCheckResponse {
    private Boolean matchFound;
    private List<MatchResult> matches;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MatchResult {
        private UUID checkResultId;
        private UUID fraudRecordId;
        private String fraudRecordName;
        private FraudCheckResult.MatchConfidence confidence;
        private Double similarityScore;
        private String matchDetails;
        private OffsetDateTime checkedAt;
    }
}


