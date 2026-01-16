package com.casino.uitests.config;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class TestDataHelper {
    private static final Pattern ID_PATTERN = Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"");

    private TestDataHelper() {
    }

    public static String ensureEmployee() {
        String response = get("/api/staff/employees");
        String id = extractFirstId(response);
        if (id != null) {
            return id;
        }
        String payload = """
            {
              "firstName": "UI",
              "lastName": "Tester",
              "middleName": "Auto",
              "position": "QA",
              "department": "Quality",
              "status": "ACTIVE",
              "contactInfo": "ui-test@example.com"
            }
            """;
        String created = post("/api/staff/employees", payload);
        id = extractFirstId(created);
        if (id == null) {
            throw new IllegalStateException("Failed to create employee via API.");
        }
        return id;
    }

    public static String randomUuid() {
        return UUID.randomUUID().toString();
    }

    private static String get(String path) {
        return send("GET", path, null);
    }

    private static String post(String path, String body) {
        return send("POST", path, body);
    }

    private static String send(String method, String path, String body) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(TestConfig.API_BASE_URL + path))
                .header("Accept", "application/json")
                .header("Authorization", basicAuth());
            if (body != null) {
                builder.header("Content-Type", "application/json");
                builder.method(method, HttpRequest.BodyPublishers.ofString(body));
            } else {
                builder.method(method, HttpRequest.BodyPublishers.noBody());
            }
            HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (IOException | InterruptedException ex) {
            throw new IllegalStateException("Failed to call API: " + method + " " + path, ex);
        }
    }

    private static String basicAuth() {
        String token = TestConfig.USERNAME + ":" + TestConfig.PASSWORD;
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    private static String extractFirstId(String body) {
        if (body == null) {
            return null;
        }
        Matcher matcher = ID_PATTERN.matcher(body);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
