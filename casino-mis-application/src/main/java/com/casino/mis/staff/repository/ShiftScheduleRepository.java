package com.casino.mis.staff.repository;

import com.casino.mis.staff.domain.ShiftSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ShiftScheduleRepository extends JpaRepository<ShiftSchedule, UUID> {
    List<ShiftSchedule> findByEmployeeId(UUID employeeId);
    List<ShiftSchedule> findByShiftDateBetween(LocalDate start, LocalDate end);
    List<ShiftSchedule> findByShiftDate(LocalDate shiftDate);
    List<ShiftSchedule> findByStatus(ShiftSchedule.ShiftStatus status);
    List<ShiftSchedule> findByEmployeeIdAndShiftDateBetween(UUID employeeId, LocalDate start, LocalDate end);
}


