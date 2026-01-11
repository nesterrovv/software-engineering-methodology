package com.casino.mis.security.dto;

import com.casino.mis.security.domain.FraudDatabase;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudRecordResponse {
    private UUID id;
    private String personId;
    private String fullName;
    private String description;
    private String photoUrl;
    private FraudDatabase.FraudType fraudType;
    private OffsetDateTime addedAt;
    private UUID addedBy;
    private OffsetDateTime lastCheckedAt;
    private Integer matchCount;
    private FraudDatabase.FraudStatus status;
}


