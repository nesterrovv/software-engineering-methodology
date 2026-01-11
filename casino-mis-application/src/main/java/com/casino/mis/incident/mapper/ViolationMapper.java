package com.casino.mis.incident.mapper;

import com.casino.mis.incident.domain.DisciplinaryViolation;
import com.casino.mis.incident.dto.CreateViolationRequest;
import com.casino.mis.incident.dto.ViolationResponse;

import java.util.List;
import java.util.stream.Collectors;

public class ViolationMapper {

    public static DisciplinaryViolation toEntity(CreateViolationRequest dto) {
        DisciplinaryViolation entity = new DisciplinaryViolation();
        entity.setEmployeeId(dto.getEmployeeId());
        entity.setType(dto.getType());
        entity.setDescription(dto.getDescription());
        entity.setAttachmentUrls(dto.getAttachmentUrls());
        return entity;
    }

    public static ViolationResponse toDto(DisciplinaryViolation e) {
        return new ViolationResponse(
                e.getId(),
                e.getEmployeeId(),
                e.getType(),
                e.getDescription(),
                e.getOccurredAt(),
                e.getStatus(),
                e.getAttachmentUrls());
    }

    public static List<ViolationResponse> toDtoList(List<DisciplinaryViolation> list) {
        return list.stream().map(ViolationMapper::toDto).collect(Collectors.toList());
    }
}
