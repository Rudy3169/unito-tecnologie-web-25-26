package com.phytosend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Classe helper per la generazione e validazione di token JWT.
 */
@Service
public class JwtUtil {

    /**
     * Estrae la chiave segreta dal file di configurazione
     */
    @Value("${jwt.secret}")
    private String secret;

    /**
     * Estrae la durata di scadenza del token dal file di configurazione
     */
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Estrae l'identificativo utente (il subject dell'email) dal token JWT fornito.
     *
     * @param token il token JSON Web Token sorgente
     * @return il nome utente estratto
     */
    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.getSubject());
    }

    /**
     * Interroga il token decodificato per recuperare uno specifico claim in base al
     * function resolver.
     *
     * @param token          il token JWT da scansionare
     * @param claimsResolver funzione per mappare la richiesta al claim
     * @param <T>            il tipo di ritorno atteso del claim (es. Date, String)
     * @return il valore desiderato estratto dai payload claims
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Genera un token JWT di base senza claims aggiuntivi per i dettagli utente.
     *
     * @param userDetails l'utente autenticato per il quale generare il token
     * @return la stringa codificata del token
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Genera un token JWT con claims aggiuntivi per i dettagli utente.
     * 
     * @param extraClaims claims aggiuntivi da includere nel token
     * @param userDetails l'utente autenticato per il quale generare il token
     * @return la stringa codificata del token
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    /**
     * Costruisce il token JWT finale.
     * 
     * @param extraClaims claims aggiuntivi da includere nel token
     * @param userDetails l'utente autenticato per il quale generare il token
     * @param expiration  durata di scadenza del token
     * @return la stringa codificata del token
     */
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Verifica la correttezza del token confrontando l'username del claim e
     * controllandone la validità temporale.
     *
     * @param token       il JWT token dal lato client
     * @param userDetails i dettagli utente correnti provenienti dal datastore
     * @return true se il token è ancora valido e appartiene all'utente
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Verifica se il token è scaduto.
     * 
     * @param token il JWT token da scansionare
     * @return true se il token è scaduto, false altrimenti
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Estrae la data di scadenza dal token.
     * 
     * @param token il JWT token da scansionare
     * @return la data di scadenza del token
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, claims -> claims.getExpiration());
    }

    /**
     * Estrae tutti i claims dal token.
     * 
     * @param token il JWT token da scansionare
     * @return tutti i claims del token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Recupera la chiave di firma per la validazione del token JWT.
     * 
     * @return la chiave di firma per la validazione del token JWT
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
