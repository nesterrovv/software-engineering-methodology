package com.casino.mis.staff.dto;

import com.casino.mis.staff.domain.WorkTimeRecord;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkTimeRecordResponse {
    private UUID id;
    private UUID employeeId;
    private OffsetDateTime clockInTime;
    private OffsetDateTime clockOutTime;
    private String deviceId;
    private WorkTimeRecord.RecordStatus status;
    private Long workedMinutes;
    private Boolean isLate;
    private Boolean hasOvertime;
    private String notes;
}


