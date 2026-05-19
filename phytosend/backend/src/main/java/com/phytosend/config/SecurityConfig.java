package com.phytosend.config;

import com.phytosend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.context.annotation.Lazy;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;

/**
 * Configurazione della sicurezza del sistema.
 * In questa classe vengono definiti i filtri di sicurezza, l'autenticazione e
 * le autorizzazioni.
 * Viene inoltre configurata la gestione delle sessioni e le regole CORS.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Indirizzo del frontend
    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Inizializzazione dei filtri di sicurezza e del user details service
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /**
     * Costruttore del SecurityConfig.
     *
     * @param jwtAuthFilter      il filtro di autenticazione JWT
     * @param userDetailsService il service per il caricamento dei dettagli
     *                           dell'utente
     */
    public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthFilter, @Lazy UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Configura la catena di filtri di sicurezza.
     * Verranno usati i filtri JWT, verrà gestita la sessione tramite JWT e verranno
     * configurate le regole CORS.
     * Le uniche rotte pubbliche sono quelle relative all'autenticazione, allo
     * Swagger, all'Actuator e ai file statici.
     * Tutto il resto richiede un token valido.
     *
     * @param http l'httpSecurity da configurare
     * @return l'httpSecurity configurato
     * @throws Exception se si verifica un errore durante la configurazione
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**", "/uploads/**",
                                "/actuator/**")
                        .permitAll() // Login, Register, Swagger, Actuator e file statici pubblici
                        .anyRequest().authenticated() // Tutto il resto richiede token
                )
                // Imposta sessione stateless per JWT
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Gestisce l'autenticazione tramite l'AuthenticationManager esposto dalla
     * configurazione globale.
     *
     * @param config la configurazione di autenticazione Spring
     * @return il manager di autenticazione configurato
     * @throws Exception se non riesce a recuperare il manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Fornisce il provider di autenticazione basato su DAO che incapsula la
     * gestione del UserDetailsService e della crittografia password.
     *
     * @return un'istanza di AuthenticationProvider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Fornisce l'algoritmo di hash (BCrypt) utilizzato per codificare e verificare
     * le password degli utenti in modo sicuro.
     *
     * @return un'istanza di BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configura le regole CORS (Cross-Origin Resource Sharing) per permettere al
     * frontend di interagire col backend in sicurezza.
     *
     * @return la sorgente di configurazione CORS che accetta specifici origini,
     *         metodi HTTP e header
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
