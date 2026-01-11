package com.casino.mis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CasinoMisApplication {
    public static void main(String[] args) {
        SpringApplication.run(CasinoMisApplication.class, args);
    }
}

