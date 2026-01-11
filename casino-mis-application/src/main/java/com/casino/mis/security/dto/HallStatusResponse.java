package com.casino.mis.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HallStatusResponse {
    private Integer totalVisitors;
    private Integer totalStaff;
    private Integer activeTables;
    private Integer anomaliesCount;
    private List<ZoneActivity> zones;
    private List<RecentActivity> recentActivities;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ZoneActivity {
        private String zoneName;
        private Integer visitorCount;
        private Integer staffCount;
        private String status; // NORMAL, HIGH_ACTIVITY, ANOMALY
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentActivity {
        private String type;
        private String description;
        private String location;
        private String timestamp;
    }
}


