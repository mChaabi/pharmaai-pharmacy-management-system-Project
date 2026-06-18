package pharmacie_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

// Configure le client HTTP pour appeler Groq
@Configuration
public class GroqConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .codecs(config -> config
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024)) // 10MB max
                .build();
    }
}