package com.casino.incident.mapper;

import com.casino.incident.domain.Complaint;
import com.casino.incident.dto.ComplaintResponse;
import com.casino.incident.dto.CreateComplaintRequest;

import java.util.List;
import java.util.stream.Collectors;

public class ComplaintMapper {

    public static Complaint toEntity(CreateComplaintRequest dto) {
        Complaint entity = new Complaint();
        entity.setCategory(dto.getCategory());
        entity.setDescription(dto.getDescription());
        entity.setSource(dto.getSource());
        entity.setReporterName(dto.getReporterName());
        entity.setRelatedIncidentId(dto.getRelatedIncidentId());
        return entity;
    }

    public static ComplaintResponse toDto(Complaint entity) {
        return new ComplaintResponse(
                entity.getId(),
                entity.getCategory(),
                entity.getDescription(),
                entity.getReportedAt(),
                entity.getSource(),
                entity.getStatus(),
                entity.getReporterName(),
                entity.getRelatedIncidentId()
        );
    }

    public static List<ComplaintResponse> toDtoList(List<Complaint> list) {
        return list.stream().map(ComplaintMapper::toDto).collect(Collectors.toList());
    }
}

