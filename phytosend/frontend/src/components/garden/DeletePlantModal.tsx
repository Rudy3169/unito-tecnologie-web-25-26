import { useState, useEffect } from 'react';
import { Skull, Trash2 } from 'lucide-react';
import type { PlantItem } from '../../types';

/**
 * COMPONENTE DELETE PLANT MODAL
 * Modale per la gestione della rimozione di una pianta dal giardino.
 * Implementa una logica a "due step" (Double Confirmation Pattern) per evitare 
 * cancellazioni accidentali e differenzia tra "Eliminazione Definitiva" e "Dichiarazione Decesso".
 */

interface DeletePlantModalProps {
    deletePrompt: number | null;
    myPlants: PlantItem[];
    setDeletePrompt: (val: number | null) => void;
    handleDeleteAction: (id: number, markAsDead: boolean) => void;
}

export function DeletePlantModal({ deletePrompt, myPlants, setDeletePrompt, handleDeleteAction }: DeletePlantModalProps) {
    const [confirmAction, setConfirmAction] = useState<'dead' | 'delete' | null>(null);

    // Resetta lo stato di conferma quando la modale viene chiusa o riaperta
    useEffect(() => {
        if (deletePrompt === null) {
            setConfirmAction(null);
        }
    }, [deletePrompt]);

    // Blocco dello scroll del body quando la modale di eliminazione pianta è aperta
    useEffect(() => {
        if (deletePrompt !== null) {
            document.body.classList.add('delete-plant-modal-open');
        } else {
            document.body.classList.remove('delete-plant-modal-open');
        }
        return () => {
            document.body.classList.remove('delete-plant-modal-open');
        };
    }, [deletePrompt]);

    if (deletePrompt === null) return null;
    const plantToDelete = myPlants.find(p => p.id === deletePrompt);

    const handleConfirm = () => {
        if (confirmAction) {
            handleDeleteAction(deletePrompt, confirmAction === 'dead');
            setConfirmAction(null);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => setDeletePrompt(null)}>
            <div className="delete-dialog" onClick={e => e.stopPropagation()}>
                {confirmAction !== null ? (
                    <div key="confirm-step">
                        <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                            {confirmAction === 'dead' ? <Skull size={20} color="var(--color-text-main)" /> : <Trash2 size={20} color="var(--color-error)" />}
                            Conferma {confirmAction === 'dead' ? 'Decesso' : 'Eliminazione'}
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                            {confirmAction === 'dead'
                                ? `Sei sicuro di voler dichiarare il decesso di "${plantToDelete?.plantName || plantToDelete?.card?.commonName}"? Verrà spostata nel cimitero delle piante per conservarne i ricordi.`
                                : `Sei sicuro di voler eliminare definitivamente "${plantToDelete?.plantName || plantToDelete?.card?.commonName}"? Questa azione è irreversibile.`
                            }
                        </p>
                        <div className="delete-actions-horizontal">
                            <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Annulla</button>
                            <button className={confirmAction === 'dead' ? 'btn-dead' : 'btn-delete'} onClick={handleConfirm}>
                                {confirmAction === 'dead' ? 'Conferma' : 'Elimina'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div key="select-step">
                        <h3>Rimuovi Pianta</h3>
                        <p>{plantToDelete?.deathDate ? "Vuoi eliminare definitivamente questa pianta dal tuo cimitero?" : "Vuoi eliminare questa pianta definitivamente o dichiararne il decesso per tenerla come ricordo?"}</p>
                        <div className="delete-actions">
                            {!plantToDelete?.deathDate && (
                                <button className="btn-dead" onClick={() => setConfirmAction('dead')}><Skull size={16} /> È Morta</button>
                            )}
                            <button className="btn-delete" onClick={() => setConfirmAction('delete')}><Trash2 size={16} /> Elimina Definitivamente</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
