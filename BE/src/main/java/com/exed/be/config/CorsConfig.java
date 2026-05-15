package com.exed.be.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // API endpoints
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*");

        // Static images — cho phép FE (Live Server) load ảnh từ BE
        registry.addMapping("/images/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*");

        // Uploaded files
        registry.addMapping("/uploads/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*");
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:GiaodienWeb/images/");
    }
}
