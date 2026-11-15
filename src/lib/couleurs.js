import { molecules } from './data.js';

// Couleurs distinctes, contraste ≥ 4,5:1 sur blanc (texte) et avec du texte blanc (puces).
const PALETTE = ['#1d4ed8', '#b45309', '#7c3aed', '#0f766e', '#be123c', '#4d7c0f', '#a21caf', '#0369a1', '#92400e', '#475569',
  '#c2410c', '#15803d', '#9d174d', '#1e3a8a', '#0f5132', '#5b21b6', '#b91c1c', '#334155', '#7e22ce', '#155e75'];

const parId = Object.fromEntries(molecules.map((m, i) => [m.id, PALETTE[i % PALETTE.length]]));
export const couleur = (id) => parId[id] ?? '#475569';
