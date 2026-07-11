import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader, Plus, Skull, Trash2, Sprout, Info, CalendarHeart, Droplets, Image as ImageIcon, Heart, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import type { PostProps, PlantItem, PostItem } from '../../types';
import { apiFetch } from '../../api';

/**
 * COMPONENTE PLANT DETAIL MODAL
 * Modale "Smart" che mostra il dettaglio di una pianta e la sua storia (Timeline).
 * Integra logiche complesse come l'ordinamento cronologico di eventi eterogenei 
 * (Post, Annaffiature, Concimazioni, Decesso) e la validazione lato client delle date.
 */

interface PlantDetailModalProps {
    selectedPlant: PlantItem | null;
    setSelectedPlant: (val: PlantItem | null) => void;
    plantPosts: PostItem[];
    loadingPosts: boolean;
    setPlantPostCards: (cards: PostProps[]) => void;
    setSelectedPostIndex: (index: number | null) => void;
    isOwnGarden: boolean;
    setDeletePrompt: (id: number) => void;
    setMyPlants?: React.Dispatch<React.SetStateAction<PlantItem[]>>;
}

export function PlantDetailModal({
    selectedPlant, setSelectedPlant, plantPosts, loadingPosts,
    setPlantPostCards, setSelectedPostIndex, isOwnGarden, setDeletePrompt, setMyPlants
}: PlantDetailModalProps) {
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [activeTab, setActiveTab] = useState<'timeline' | 'posts'>('timeline');

    const [isAddCareEventModalOpen, setIsAddCareEventModalOpen] = useState(false);
    const [addCareEventType, setAddCareEventType] = useState('ACQUA');
    const [addCareEventDate, setAddCareEventDate] = useState('');
    const [isSubmittingCareEvent, setIsSubmittingCareEvent] = useState(false);
    const [careEventPopup, setCareEventPopup] = useState<{ type: 'error' | 'success', title: string, text: string } | null>(null);

    const handleAddCareEvent = async () => {
        if (!addCareEventDate || !selectedPlant) return;

        // Front-end Date Validation
        const maxDateStr = new Date().toISOString().split('T')[0];
        if (addCareEventDate > maxDateStr) {
            setCareEventPopup({
                type: 'error',
                title: 'Attenzione',
                text: 'La data non può essere successiva ad oggi.'
            });
            return;
        }

        const lastEvent = selectedPlant.careEvents
            ?.filter(ce => ce.completed && ce.type === addCareEventType)
            ?.sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())[0];

        let minDateStr: string | undefined;
        if (lastEvent && lastEvent.completedDate) {
            minDateStr = new Date(lastEvent.completedDate).toISOString().split('T')[0];
        } else if (selectedPlant.purchaseDate) {
            minDateStr = new Date(selectedPlant.purchaseDate).toISOString().split('T')[0];
        }

        if (minDateStr && addCareEventDate < minDateStr) {
            // Formattazione data europea per il messaggio di errore
            const [y, m, d] = minDateStr.split('-');
            setCareEventPopup({
                type: 'error',
                title: 'Attenzione',
                text: `La data non può essere precedente all'ultimo evento o all'acquisto (${d}/${m}/${y}).`
            });
            return;
        }

        // Check if there is already an event on the same day as the selected date
        if (minDateStr && addCareEventDate === minDateStr && lastEvent && lastEvent.completedDate) {
            const lastEventDateStr = new Date(lastEvent.completedDate).toISOString().split('T')[0];
            if (lastEventDateStr === addCareEventDate) {
                // Formattazione data europea per il messaggio di errore
                const [y, m, d] = addCareEventDate.split('-');

                // Messaggio differenziato per "oggi" o date passate
                if (addCareEventDate === new Date().toISOString().split('T')[0]) {
                    setCareEventPopup({
                        type: 'success',
                        title: 'Evento Cura Completato',
                        text: `Per oggi hai già completato questo tipo di cura!`
                    });
                } else {
                    setCareEventPopup({
                        type: 'success',
                        title: 'Evento Cura Completato',
                        text: `Hai già completato questo tipo di cura per la data ${d}/${m}/${y}.`
                    });
                }
                return;
            }
        }

        setIsSubmittingCareEvent(true);
        setCareEventPopup(null);
        try {
            const token = localStorage.getItem('phytosend_token');
            const userId = localStorage.getItem('phytosend_userId');
            const res = await apiFetch(`/api/utenti/${userId}/piante/${selectedPlant.id}/care-events`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: addCareEventType,
                    date: addCareEventDate
                })
            });
            if (res.ok) {
                const updatedPlant = await res.json();
                const newPlantMapped = {
                    ...updatedPlant,
                    plantName: updatedPlant.name,
                    isDead: updatedPlant.deathDate !== null
                };
                setSelectedPlant(newPlantMapped);
                if (setMyPlants) {
                    setMyPlants(prev => prev.map(p => p.id === newPlantMapped.id ? newPlantMapped : p));
                }
                setIsAddCareEventModalOpen(false);
                setAddCareEventDate('');
                setAddCareEventType('ACQUA');
            } else {
                let errorMsg = 'Errore sconosciuto';
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    errorMsg = res.statusText;
                }
                setCareEventPopup({
                    type: 'error',
                    title: 'Attenzione',
                    text: `Errore durante il salvataggio. Status: ${res.status}. Dettaglio: ${errorMsg}`
                });
            }
        } catch (err: any) {
            setCareEventPopup({
                type: 'error',
                title: 'Attenzione',
                text: `Errore di connessione: ${err.message}`
            });
        } finally {
            setIsSubmittingCareEvent(false);
        }
    };

    useEffect(() => {
        if (selectedPlant !== null) {
            document.body.classList.add('plant-detail-modal-open');
            setShowAllEvents(false);
            setActiveTab('timeline');
        } else {
            document.body.classList.remove('plant-detail-modal-open');
        }
        return () => {
            document.body.classList.remove('plant-detail-modal-open');
        };
    }, [selectedPlant]);

    if (!selectedPlant) return null;

    return (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
            <div className="plant-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={() => setSelectedPlant(null)}><X size={24} /></button>

                <div className="detail-header" style={{ backgroundImage: `url(${(plantPosts.length > 0 ? (plantPosts[0].urlphoto || plantPosts[0].URLPhoto) : null) || selectedPlant.urlPhoto || selectedPlant.card?.urlDefaultPhoto})` }}>
                    <div className="detail-header-content">
                        {selectedPlant.deathDate && <span className="plant-status-badge dead-badge"><Skull size={12} /> Deceduta</span>}
                        {!selectedPlant.deathDate && <span className="plant-status-badge alive-badge"><Sprout size={12} /> In vita</span>}
                        <h2>{selectedPlant.plantName || selectedPlant.card?.commonName}</h2>
                        <p><i>{selectedPlant.card?.scientificName}</i></p>
                    </div>
                </div>
                <div className="detail-body">
                    <div className="detail-section">
                        <h4>
                            {selectedPlant.card?.id ? (
                                <Link to={`/plant/${selectedPlant.card.id}`} className="scheda-botanica-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} /> Scheda Botanica
                                </Link>
                            ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} /> Scheda Botanica
                                </span>
                            )}
                        </h4>
                        <ul>
                            <li><strong>Famiglia:</strong> {selectedPlant.card?.family}</li>
                            <li><strong>Esposizione:</strong> {selectedPlant.card?.exposure}</li>
                            <li><strong>Terreno:</strong> {selectedPlant.card?.soil}</li>
                            <li><strong>Concimazione:</strong> {selectedPlant.card?.fertilization}</li>
                            <li className="full-width-li">
                                <strong>Irrigazione consigliata:</strong> {
                                    selectedPlant.card?.waterFrequencyDays
                                        ? `ogni ${selectedPlant.card.waterFrequencyDays} giorni`
                                        : 'Da pianificare'
                                }
                            </li>
                        </ul>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--color-border)', margin: '0 -24px' }}></div>

                    <div className="plant-tabs">
                        <button
                            className={`plant-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                            onClick={() => setActiveTab('timeline')}
                        >
                            <CalendarHeart size={16} /> Timeline
                        </button>
                        <button
                            className={`plant-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            <ImageIcon size={16} /> Post ({plantPosts.length})
                        </button>
                    </div>

                    {activeTab === 'timeline' && (
                        <div className="detail-section timeline-section-wrapper" style={{ position: 'relative' }}>
                            {!selectedPlant.deathDate && isOwnGarden && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                    <button
                                        className="add-care-event-trigger-btn"
                                        onClick={() => setIsAddCareEventModalOpen(true)}
                                        title="Aggiungi evento cura"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            )}
                            {(() => {
                                // ==========================================
                                // GESTIONE DATE & TIMEZONE SHIFT (FIX)
                                // ==========================================
                                // Fissa forzatamente l'orario a mezzogiorno (T12:00:00) per evitare che, 
                                // a causa dei fusi orari (es. GMT+1 vs UTC), una data passata come "2026-05-21T00:00:00Z" 
                                // venga renderizzata dal client come il giorno precedente (2026-05-20 alle 23:00).
                                const parseDateForceNoon = (d: string | Date | undefined | null) => {
                                    if (!d) return new Date();
                                    if (typeof d === 'string' && d.length === 10) {
                                        return new Date(d + 'T12:00:00');
                                    }
                                    return new Date(d);
                                };

                                type TimelineEvent = {
                                    id: string;
                                    date: Date;
                                    title: string;
                                    type: string;
                                    imageUrl?: string | null;
                                    completed?: boolean;
                                    postIndex?: number;
                                };
                                const events: TimelineEvent[] = [];

                                // 1. Purchase event
                                events.push({
                                    id: 'purchase',
                                    date: parseDateForceNoon(selectedPlant.purchaseDate),
                                    title: 'Pianta aggiunta',
                                    type: 'PURCHASE',
                                    imageUrl: (plantPosts.length > 0 ? (plantPosts[0].urlphoto || plantPosts[0].URLPhoto) : null) || selectedPlant.urlPhoto || selectedPlant.card?.urlDefaultPhoto
                                });

                                // 2. Death event
                                if (selectedPlant.deathDate) {
                                    events.push({
                                        id: 'death',
                                        date: parseDateForceNoon(selectedPlant.deathDate),
                                        title: 'Dichiarata morta',
                                        type: 'DEATH'
                                    });
                                }

                                // 3. Care events
                                if (selectedPlant.careEvents) {
                                    selectedPlant.careEvents.forEach(ce => {
                                        if (ce.completed && ce.completedDate) {
                                            const completedDate = parseDateForceNoon(ce.completedDate);
                                            // Se la pianta è morta, ignoriamo gli eventi cura completati DOPO la data di morte
                                            if (!selectedPlant.deathDate || completedDate <= parseDateForceNoon(selectedPlant.deathDate)) {
                                                events.push({
                                                    id: `care-${ce.id}`,
                                                    date: completedDate,
                                                    title: ce.type === 'ACQUA' ? 'Annaffiata' :
                                                        ce.type === 'CONCIME' ? 'Concimata' :
                                                            ce.type === 'TRAVASO' ? 'Travasata' : 'Cura completata',
                                                    type: ce.type,
                                                    completed: true
                                                });
                                            }
                                        } else if (!ce.completed && !selectedPlant.deathDate) {
                                            events.push({
                                                id: `care-${ce.id}`,
                                                date: parseDateForceNoon(ce.programmedDate),
                                                title: ce.type === 'ACQUA' ? 'Prossima Annaffiatura' :
                                                    ce.type === 'CONCIME' ? 'Prossima Concimazione' :
                                                        ce.type === 'TRAVASO' ? 'Prossimo Travaso' : 'Prossima Cura',
                                                type: ce.type,
                                                completed: false
                                            });
                                        }
                                    });
                                }

                                // 4. Post events
                                if (plantPosts && plantPosts.length > 0) {
                                    plantPosts.forEach((post, index) => {
                                        events.push({
                                            id: `post-${post.id}`,
                                            date: parseDateForceNoon(post.creationDate),
                                            title: 'Aggiunta Foto',
                                            type: 'POST',
                                            imageUrl: post.urlphoto || post.URLPhoto,
                                            postIndex: index,
                                            completed: true
                                        });
                                    });
                                }

                                // Sort descending by date, but force PURCHASE to be always at the very bottom
                                events.sort((a, b) => {
                                    // PURCHASE sta sempre in fondo in modo assoluto, anche se ci sono discrepanze di date
                                    if (a.type === 'PURCHASE' && b.type !== 'PURCHASE') return 1;
                                    if (b.type === 'PURCHASE' && a.type !== 'PURCHASE') return -1;

                                    const timeDiff = b.date.getTime() - a.date.getTime();
                                    return timeDiff;
                                });

                                const displayedEvents = showAllEvents ? events : events.slice(0, 5);

                                return (
                                    <div className="timeline-modern">
                                        {displayedEvents.map((ev) => {
                                            const dateStr = ev.date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

                                            let iconColor = '#0ea5e9'; // Blue for water
                                            if (ev.type === 'PURCHASE') iconColor = '#22c55e';
                                            else if (ev.type === 'DEATH') iconColor = '#ef4444';
                                            else if (ev.type === 'CONCIME') iconColor = '#eab308';
                                            else if (ev.type === 'TRAVASO') iconColor = '#f97316';
                                            else if (ev.type === 'POST') iconColor = '#8b5cf6'; // Purple for posts

                                            return (
                                                <div key={ev.id} className="timeline-item-modern">
                                                    <div className="timeline-date-label">
                                                        <span>{dateStr}</span>
                                                    </div>
                                                    <div className="timeline-content-card">
                                                        <div className="timeline-card-header">
                                                            <div className="timeline-icon" style={{ backgroundColor: `${iconColor}20`, color: iconColor }}>
                                                                {ev.type === 'ACQUA' && <Droplets size={18} />}
                                                                {ev.type === 'CONCIME' && <Plus size={18} />}
                                                                {ev.type === 'TRAVASO' && <Sprout size={18} />}
                                                                {ev.type === 'PURCHASE' && <Sprout size={18} />}
                                                                {ev.type === 'DEATH' && <Skull size={18} />}
                                                                {ev.type === 'POST' && <ImageIcon size={18} />}
                                                            </div>
                                                            <span className={`timeline-title ${!ev.completed && ev.type !== 'PURCHASE' && ev.type !== 'DEATH' ? 'timeline-future' : ''}`}>
                                                                {ev.title}
                                                            </span>
                                                        </div>
                                                        {ev.type === 'POST' && ev.imageUrl && (
                                                            <div
                                                                className={`timeline-image-container ${ev.type === 'POST' ? 'timeline-post-clickable' : ''}`}
                                                                onClick={ev.type === 'POST' ? (e) => {
                                                                    e.stopPropagation();
                                                                    const cards: PostProps[] = plantPosts.map((p: any) => ({
                                                                        id: p.id,
                                                                        title: p.title,
                                                                        description: p.description,
                                                                        urlphoto: p.urlphoto || p.URLPhoto || '',
                                                                        creationDate: p.creationDate,
                                                                        author: p.author,
                                                                        plant: p.plant,
                                                                        likesCount: p.likesCount ?? 0,
                                                                        isLikedByMe: p.likedByMe ?? p.isLikedByMe ?? false,
                                                                        isSavedByMe: p.savedByMe ?? p.isSavedByMe ?? false,
                                                                        commentsCount: p.commentsCount ?? 0,
                                                                        onCommentUpdate: () => { },
                                                                    }));
                                                                    setPlantPostCards(cards);
                                                                    setSelectedPostIndex(ev.postIndex!);
                                                                } : undefined}
                                                                style={ev.type === 'POST' ? { cursor: 'pointer' } : {}}
                                                            >
                                                                <img src={ev.imageUrl} alt={ev.title} className="timeline-event-img" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {!showAllEvents && events.length > 5 && (
                                            <div className="timeline-expand-container">
                                                <button
                                                    className="timeline-expand-btn"
                                                    onClick={() => setShowAllEvents(true)}
                                                >
                                                    Vedi tutti gli eventi ({events.length})
                                                </button>
                                            </div>
                                        )}
                                        {showAllEvents && events.length > 5 && (
                                            <div className="timeline-expand-container">
                                                <button
                                                    className="timeline-expand-btn"
                                                    onClick={() => setShowAllEvents(false)}
                                                >
                                                    Mostra meno
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* MODALE AGGIUNTA EVENTO CURA MANUALE */}
                    {isAddCareEventModalOpen && (
                        <div className="modal-overlay" onClick={() => setIsAddCareEventModalOpen(false)} style={{ zIndex: 1100 }}>
                            <div className="care-event-modal" onClick={e => e.stopPropagation()}>
                                <div className="care-event-modal-header">
                                    <h3>Aggiungi Evento Cura</h3>
                                    <button className="close-btn" onClick={() => setIsAddCareEventModalOpen(false)}><X size={20} /></button>
                                </div>
                                <div className="care-event-modal-body">
                                    <div className="form-group">
                                        <label>Tipo di Cura</label>
                                        <select
                                            value={addCareEventType}
                                            onChange={e => setAddCareEventType(e.target.value)}
                                            className={`care-type-select type-${addCareEventType.toLowerCase()}`}
                                        >
                                            <option value="ACQUA">Annaffiatura</option>
                                            <option value="CONCIME">Concimazione</option>
                                            <option value="TRAVASO">Travaso</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Data Completamento</label>
                                        <input
                                            type="date"
                                            value={addCareEventDate}
                                            onChange={e => setAddCareEventDate(e.target.value)}
                                            onClick={(e) => {
                                                if ('showPicker' in HTMLInputElement.prototype) {
                                                    try {
                                                        (e.target as HTMLInputElement).showPicker();
                                                    } catch (err) { }
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                            max={new Date().toISOString().split('T')[0]}
                                            min={(() => {
                                                // Trova l'ultimo evento completato dello stesso tipo
                                                const lastEvent = selectedPlant?.careEvents
                                                    ?.filter(ce => ce.completed && ce.type === addCareEventType)
                                                    ?.sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())[0];
                                                if (lastEvent && lastEvent.completedDate) {
                                                    return new Date(lastEvent.completedDate).toISOString().split('T')[0];
                                                }
                                                return selectedPlant?.purchaseDate ? new Date(selectedPlant.purchaseDate).toISOString().split('T')[0] : undefined;
                                            })()}
                                        />
                                    </div>
                                </div>
                                <div className="care-event-modal-footer">
                                    <button className="btn-cancel" onClick={() => setIsAddCareEventModalOpen(false)}>Annulla</button>
                                    <button className="btn-confirm" onClick={handleAddCareEvent} disabled={!addCareEventDate || isSubmittingCareEvent}>
                                        {isSubmittingCareEvent ? 'Salvataggio...' : 'Salva'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* POP-UP ERRORE/SUCCESSO CARE EVENT */}
                    {careEventPopup && (
                        <div className="modal-overlay" onClick={() => setCareEventPopup(null)} style={{ zIndex: 1200 }}>
                            <div className="delete-dialog" onClick={e => e.stopPropagation()}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: careEventPopup.type === 'success' ? '#22c55e' : '#ef4444',
                                    marginBottom: '16px'
                                }}>
                                    {careEventPopup.type === 'success' ? <CheckCircle size={36} /> : <AlertTriangle size={36} />}
                                </div>
                                <h3 style={{ marginBottom: '12px' }}>{careEventPopup.title}</h3>
                                <p style={{ fontSize: '1.05rem' }}>{careEventPopup.text}</p>
                                <div className="delete-actions" style={{ marginTop: '24px' }}>
                                    <button
                                        className="btn-confirm"
                                        onClick={() => setCareEventPopup(null)}
                                        style={{
                                            width: '100%',
                                            background: careEventPopup.type === 'success' ? '#22c55e' : 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        Ho capito
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'posts' && (
                        <div className="detail-section">
                            {loadingPosts ? (
                                <div className="posts-loading"><Loader size={20} className="spin" /> Caricamento post...</div>
                            ) : plantPosts.length > 0 ? (
                                <div className="plant-posts-grid">
                                    {plantPosts.map((post, index) => (
                                        <div key={post.id} className="plant-post-thumb" onClick={(e) => {
                                            e.stopPropagation();
                                            const cards: PostProps[] = plantPosts.map((p: any) => ({
                                                id: p.id,
                                                title: p.title,
                                                description: p.description,
                                                urlphoto: p.urlphoto || p.URLPhoto || '',
                                                creationDate: p.creationDate,
                                                author: p.author,
                                                plant: p.plant,
                                                likesCount: p.likesCount ?? 0,
                                                isLikedByMe: p.likedByMe ?? p.isLikedByMe ?? false,
                                                isSavedByMe: p.savedByMe ?? p.isSavedByMe ?? false,
                                                commentsCount: p.commentsCount ?? 0,
                                                onCommentUpdate: () => { },
                                            }));
                                            setPlantPostCards(cards);
                                            setSelectedPostIndex(index);
                                        }}>
                                            {(post.urlphoto || post.URLPhoto) ? (
                                                <img src={(post.urlphoto || post.URLPhoto)!} alt={post.title} />
                                            ) : (
                                                <div className="post-thumb-placeholder"><ImageIcon size={24} /></div>
                                            )}
                                            <div className="post-thumb-overlay">
                                                <span><Heart size={12} /> {post.likesCount}</span>
                                                <span><MessageCircle size={12} /> {post.commentsCount || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">Nessun post associato a questa pianta.</p>
                            )}
                        </div>
                    )}
                </div>

                {isOwnGarden && (
                    <div className="detail-footer">
                        <button className="btn-delete-full" onClick={() => { setDeletePrompt(selectedPlant.id); setSelectedPlant(null); }}>
                            <Trash2 size={18} />
                            <span>
                                {selectedPlant.deathDate ? (
                                    'Elimina definitivamente'
                                ) : (
                                    <>
                                        Rimuovi o <br className="mobile-br" /> segna come morta
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

}

