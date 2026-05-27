/**
 * BARREL PATTERN (Indice dei Tipi)
 * 
 * Esporta tutte le interfacce TypeScript del dominio frontend.
 * Questo pattern architetturale permette di importare i tipi nei componenti React da un unico 
 * entry point (es. `import { PostItem, UserProfile } from '../../types';`) 
 * mantenendo puliti gli import ed evitando percorsi relativi complessi.
 */

export * from './user';
export * from './plant';
export * from './post';
export * from './notification';
