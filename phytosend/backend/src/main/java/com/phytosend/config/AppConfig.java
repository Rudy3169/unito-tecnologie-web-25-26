package com.phytosend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * Fornisce un'istanza di RestTemplate da iniettare nei servizi per effettuare chiamate HTTP esterne.
     *
     * @return una nuova istanza configurata di RestTemplate
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
