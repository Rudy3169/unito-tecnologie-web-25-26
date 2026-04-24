package com.phytosend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro di autenticazione JWT che intercetta ogni richiesta HTTP per estrarre
 * e validare il token JWT dall'header Authorization.
 * Se il token è valido, imposta l'identità dell'utente nel contesto di
 * sicurezza di Spring.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Intercetta una richiesta HTTP per estrarre e validare il token JWT
     * dall'header Authorization.
     * Se il token è valido, imposta l'identità dell'utente nel contesto di
     * sicurezza di Spring.
     *
     * @param request     la richiesta HTTP in ingresso
     * @param response    la risposta HTTP
     * @param filterChain la catena di filtri per la chiamata successiva
     * @throws ServletException in caso di errori del servlet
     * @throws IOException      in caso di errori di Input/Output durante la lettura
     *                          della richiesta
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization"); // Estrae il token
        final String jwt; // Token JWT
        final String userEmail; // Email utente

        // Salta il filtro se l'header non contiene il token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7); // Estrae il token rimuovendo il prefisso "Bearer "
        userEmail = jwtService.extractUsername(jwt); // Estrae l'email dal token

        // Se l'email è valida e l'utente non è autenticato
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail); // Carica l'utente

            // Se il token è valido
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Crea un token di autenticazione
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());
                // Imposta i dettagli del token
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                // Imposta il token nel contesto di sicurezza
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Chiama il prossimo filtro nella catena
        filterChain.doFilter(request, response);
    }
}
