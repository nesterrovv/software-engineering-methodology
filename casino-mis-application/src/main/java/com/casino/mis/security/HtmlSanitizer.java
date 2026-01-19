package com.casino.mis.security;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Component;

/**
 * HTML Sanitizer for XSS prevention
 * Uses OWASP Java HTML Sanitizer to clean user input
 * 
 * This component should be used for all text fields that accept user input
 * and may be displayed in web interfaces or reports.
 */
@Component
public class HtmlSanitizer {

    /**
     * Policy that allows only plain text (strips all HTML)
     * Most secure option for fields that don't need HTML
     */
    private static final PolicyFactory PLAIN_TEXT_POLICY = new HtmlPolicyBuilder()
            .toFactory();

    /**
     * Policy that allows basic formatting (bold, italic, lists)
     * Use for rich text fields where basic formatting is needed
     */
    private static final PolicyFactory BASIC_FORMATTING_POLICY = new HtmlPolicyBuilder()
            .allowElements("b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li")
            .toFactory();

    /**
     * Sanitize input to plain text only (removes all HTML)
     * Recommended for most user input fields
     * 
     * @param input potentially malicious HTML input
     * @return sanitized plain text
     */
    public String sanitizeToPlainText(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return PLAIN_TEXT_POLICY.sanitize(input);
    }

    /**
     * Sanitize input allowing basic HTML formatting
     * Use only for fields that explicitly need rich text
     * 
     * @param input potentially malicious HTML input
     * @return sanitized HTML with only allowed tags
     */
    public String sanitizeWithBasicFormatting(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return BASIC_FORMATTING_POLICY.sanitize(input);
    }

    /**
     * Check if input contains potentially malicious HTML
     * 
     * @param input text to check
     * @return true if input was modified by sanitization (contained HTML)
     */
    public boolean containsHtml(String input) {
        if (input == null || input.isEmpty()) {
            return false;
        }
        String sanitized = sanitizeToPlainText(input);
        return !input.equals(sanitized);
    }
}
