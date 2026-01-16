package com.casino.uitests.config;

import java.time.Duration;

public final class TestConfig {
    public static final String UI_BASE_URL = env("UI_BASE_URL", "http://localhost:5173");
    public static final String UI_API_BASE_URL = env("UI_API_BASE_URL", "");
    public static final String API_BASE_URL = env("API_BASE_URL", "http://localhost:8080");
    public static final String USERNAME = env("UI_USERNAME", "admin");
    public static final String PASSWORD = env("UI_PASSWORD", "admin");
    public static final String BROWSER = env("UI_BROWSER", "chrome");
    public static final boolean HEADLESS = Boolean.parseBoolean(env("UI_HEADLESS", "true"));
    public static final Duration TIMEOUT = Duration.ofSeconds(12);

    private TestConfig() {
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return value == null ? fallback : value;
    }
}
