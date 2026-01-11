package com.casino.incident.mapper;

import com.casino.incident.domain.Report;
import com.casino.incident.dto.ReportResponse;

import java.util.List;
import java.util.stream.Collectors;

public class ReportMapper {

    public static ReportResponse toDto(Report entity) {
        return new ReportResponse(
                entity.getId(),
                entity.getType(),
                entity.getGeneratedAt(),
                entity.getPeriodStart(),
                entity.getPeriodEnd(),
                entity.getReportData(),
                entity.getStatus(),
                entity.getGeneratedBy()
        );
    }

    public static List<ReportResponse> toDtoList(List<Report> list) {
        return list.stream().map(ReportMapper::toDto).collect(Collectors.toList());
    }
}

