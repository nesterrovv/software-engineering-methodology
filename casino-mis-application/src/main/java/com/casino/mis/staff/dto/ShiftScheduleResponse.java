package com.casino.mis.staff.dto;

import com.casino.mis.staff.domain.ShiftSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShiftScheduleResponse {
    private UUID id;
    private UUID employeeId;
    private LocalDate shiftDate;
    private OffsetDateTime plannedStartTime;
    private OffsetDateTime plannedEndTime;
    private ShiftSchedule.ShiftStatus status;
    private ShiftSchedule.ShiftType shiftType;
    private String location;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime publishedAt;
    private UUID confirmedBy;
    private OffsetDateTime confirmedAt;
    private String notes;
}


