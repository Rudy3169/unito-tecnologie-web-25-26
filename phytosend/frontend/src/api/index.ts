/**
 * API FETCH WRAPPER (Interceptor Pattern base)
 * 
 * Centralizza tutte le chiamate di rete verso il backend (Spring Boot).
 * Agisce da "Interceptor": se il server restituisce codici di errore critici 
 * legati all'autenticazione (401 Unauthorized, 403 Forbidden) o al server (500, 502, 504),
 * intercetta la Response prima che arrivi ai componenti React ed esegue un logout 
 * forzato (cancellazione del JWT dal localStorage) per ragioni di sicurezza e coerenza di stato.
 *
 * Questo risolve specifici edge-case:
 * Es. Dopo il riavvio di Docker, se il backend restituisce 500 perché i token 
 * in memoria non sono più validi, forziamo il logout per ristabilire la sessione.
 */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options);

    if ([401, 403, 500, 502, 504].includes(response.status)) {
        console.warn(`[apiFetch] Ricevuto status ${response.status} da ${url} — logout automatico.`);
        localStorage.clear();
        window.location.href = '/';
        // Restituiamo comunque la response, ma il redirect avverrà subito
        return response;
    }

    return response;
}
