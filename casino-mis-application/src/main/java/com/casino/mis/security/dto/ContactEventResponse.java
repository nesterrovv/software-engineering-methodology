package com.casino.mis.security.dto;

import com.casino.mis.security.domain.ContactEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContactEventResponse {
    private UUID id;
    private String personId1;
    private String personId2;
    private OffsetDateTime contactStartTime;
    private OffsetDateTime contactEndTime;
    private Long durationSeconds;
    private String location;
    private ContactEvent.ContactStatus status;
    private Boolean suspicious;
    private UUID suspiciousActivityId;
}


