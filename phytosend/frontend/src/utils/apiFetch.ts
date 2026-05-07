/**
 * Wrapper centralizzato per le chiamate fetch all'API.
 * Se il server risponde con 401, 403 o 500, esegue automaticamente il logout
 * cancellando il localStorage e riportando l'utente alla pagina di login.
 *
 * Questo risolve il problema in cui, dopo l'avvio di Docker, il backend
 * non è ancora pronto e restituisce 500. Un logout automatico forza un
 * nuovo login che ristabilisce lo stato correttamente.
 */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403 || response.status === 500) {
        console.warn(`[apiFetch] Ricevuto status ${response.status} da ${url} — logout automatico.`);
        localStorage.clear();
        window.location.href = '/';
        // Restituiamo comunque la response, ma il redirect avverrà subito
        return response;
    }

    return response;
}
