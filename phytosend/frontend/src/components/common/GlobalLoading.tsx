import './GlobalLoading.css';
import logoLight from '../../assets/logo/PhytoSend/logo & scritta/v2 verde scuro.png';
import logoDark from '../../assets/logo/PhytoSend/logo & scritta/v2 bianco.png';

/**
 * COMPONENTE GLOBAL LOADING
 * Schermata di caricamento a tutto schermo usata in fase di bootstrap dell'app o login.
 * Supporta dinamicamente il Dark/Light mode tramite lettura dell'attributo DOM `data-theme`
 * e fornisce feedback contestuale all'utente in caso di ritardi (es. Cold Start del server).
 */

interface GlobalLoadingProps {
    isTakingLong?: boolean;
}

export function GlobalLoading({ isTakingLong }: GlobalLoadingProps) {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    return (
        <div className="global-loading-container">
            <div className="global-loading-content">
                <img
                    src={isDarkMode ? logoDark : logoLight}
                    alt="PhytoSend"
                    className="global-loading-logo"
                />
                <div className="loading-spinner"></div>
                <h2 className="loading-text">
                    {isTakingLong ? "Il server sta impiegando più tempo del previsto..." : "Caricamento del tuo giardino in corso..."}
                </h2>
                <p className="loading-subtext">
                    {isTakingLong ? "Potrebbe essere necessario ancora qualche istante per avviare il database e i servizi." : "Stiamo caricando il tuo giardino, potrebbe volerci qualche istante."}
                </p>
            </div>
        </div>
    );
}
