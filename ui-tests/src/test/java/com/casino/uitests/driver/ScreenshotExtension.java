package com.casino.uitests.driver;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

public class ScreenshotExtension implements TestWatcher {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        WebDriver driver = DriverStore.get();
        if (!(driver instanceof TakesScreenshot)) {
            return;
        }
        String testName = context.getDisplayName().replaceAll("[^a-zA-Z0-9-_]", "_");
        String timestamp = LocalDateTime.now().format(FORMATTER);
        Path folder = Path.of("ui-tests", "artifacts");
        try {
            Files.createDirectories(folder);
            Path target = folder.resolve(testName + "-" + timestamp + ".png");
            byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            Files.write(target, screenshot);
        } catch (IOException ignored) {
            // Ignore screenshot failures to not hide the real test error.
        }
    }

    @Override
    public void testDisabled(ExtensionContext context, Optional<String> reason) {
        // no-op
    }
}
