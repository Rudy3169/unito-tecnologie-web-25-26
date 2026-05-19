package com.phytosend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configurazione per servire i file caricati (es. foto profilo)
 * come risorse statiche accessibili dal frontend tramite /uploads/**.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Directory base delle risorse statiche
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Aggiunge i gestori di risorse. In particolare, configura l'esposizione dei
     * file caricati tramite l'URL /uploads/**.
     * 
     * @param registry il registro delle risorse da configurare
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
