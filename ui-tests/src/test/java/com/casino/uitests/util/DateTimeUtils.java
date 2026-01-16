package com.casino.uitests.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateTimeUtils {
    private static final DateTimeFormatter DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private DateTimeUtils() {
    }

    public static String dateTimeMinusHours(int hours) {
        return LocalDateTime.now().minusHours(hours).format(DATETIME);
    }

    public static String dateTimePlusHours(int hours) {
        return LocalDateTime.now().plusHours(hours).format(DATETIME);
    }

    public static String dateMinusDays(int days) {
        return LocalDate.now().minusDays(days).toString();
    }

    public static String datePlusDays(int days) {
        return LocalDate.now().plusDays(days).toString();
    }
}
