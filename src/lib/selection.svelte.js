// État partagé entre les vues, encodé dans l'URL : #/mecanisme?m=tocilizumab,sarilumab
import { molecules } from './data.js';

const valides = new Set(molecules.map((m) => m.id));
export const etat = $state({ chemin: '/mecanisme', ids: [] });

function lire() {
  const [chemin, q = ''] = (location.hash.slice(1) || '/mecanisme').split('?');
  const ids = (new URLSearchParams(q).get('m') ?? '').split(',').filter((id) => valides.has(id));
  etat.chemin = chemin;
  etat.ids = [...new Set(ids)];
}

/** Lien vers une vue en conservant la sélection. */
export const hash = (chemin = etat.chemin) => '#' + chemin + (etat.ids.length ? '?m=' + etat.ids.join(',') : '');

const ecrire = () => history.replaceState(null, '', hash());

export function ajouter(id) {
  if (valides.has(id) && !etat.ids.includes(id)) {
    etat.ids.push(id);
    ecrire();
  }
}

export function retirer(id) {
  etat.ids = etat.ids.filter((x) => x !== id);
  ecrire();
}

if (typeof window !== 'undefined') {
  lire();
  addEventListener('hashchange', lire);
}
