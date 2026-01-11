package com.casino.mis.staff.dto;

import com.casino.mis.staff.domain.ShiftSchedule;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShiftScheduleRequest {
    @NotNull
    private UUID employeeId;
    
    @NotNull
    private LocalDate shiftDate;
    
    @NotNull
    private OffsetDateTime plannedStartTime;
    
    @NotNull
    private OffsetDateTime plannedEndTime;
    
    @NotNull
    private ShiftSchedule.ShiftType shiftType;
    
    private String location;
    
    private UUID createdBy;
    
    private String notes;
}


