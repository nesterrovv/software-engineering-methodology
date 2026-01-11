package com.casino.mis.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI casinoMisOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Casino MIS API")
                        .description("API для системы управления казино. Монолитное приложение, объединяющее модули инцидентов и финансов.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Casino MIS Team")
                                .email("support@casino-mis.local")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("http://casino-mis-application:8080").description("Docker Container")
                ));
    }
}


