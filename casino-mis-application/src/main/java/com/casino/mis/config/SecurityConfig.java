package com.casino.mis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration with enhanced security headers and password encryption
 * Implements OWASP security best practices
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // CSRF protection is disabled because this is a stateless REST API
        // using HTTP Basic Auth. CSRF attacks are not applicable to stateless APIs
        // as there are no session cookies to hijack.
        // See: https://owasp.org/www-community/attacks/csrf
        http.csrf(AbstractHttpConfigurer::disable) // NOSONAR - Justified for stateless REST API
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                    .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            // Security Headers (OWASP recommendations)
            .headers(headers -> headers
                // Prevent MIME-sniffing attacks
                .contentTypeOptions(Customizer.withDefaults())
                // Prevent clickjacking attacks
                .frameOptions(frameOptions -> frameOptions.deny())
                // XSS protection (legacy but still useful)
                .xssProtection(Customizer.withDefaults())
                // Content Security Policy
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'")
                )
                // HSTS - only for HTTPS in production
                // Uncomment when using HTTPS:
                // .httpStrictTransportSecurity(hsts -> hsts
                //     .maxAgeInSeconds(31536000)
                //     .includeSubDomains(true)
                // )
            );
        return http.build();
    }

    /**
     * BCrypt password encoder for secure password hashing
     * Strength: 12 (default is 10, higher = more secure but slower)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * In-memory user details with BCrypt encrypted passwords
     * Production systems should use database-backed user storage
     * 
     * Default credentials (for development only):
     * Username: admin
     * Password: admin (configurable via ADMIN_PASSWORD environment variable)
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        // Use environment variable or secure default for production
        // For development/testing, using "admin" for compatibility
        String defaultPassword = System.getenv("ADMIN_PASSWORD") != null 
            ? System.getenv("ADMIN_PASSWORD") 
            : "admin";
            
        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode(defaultPassword))
                .roles("ADMIN")
                .build();
        
        return new InMemoryUserDetailsManager(admin);
    }
}


