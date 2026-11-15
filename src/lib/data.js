import molecules from '../data/molecules.json';
import cibles from '../data/cibles.json';
import voies from '../data/voies.json';
import maladies from '../data/maladies.json';
import carte from '../data/carte.json';

const index = (liste) => Object.fromEntries(liste.map((x) => [x.id, x]));

export { molecules, cibles, voies, maladies, carte };
export const maladieParId = Object.fromEntries(maladies.map((x) => [x.id, x]));
export const moleculeParId = index(molecules);
export const cibleParId = index(cibles);
export const voieParId = index(voies);

export const A_VALIDER = 'à valider';
/** Tout champ vide s'affiche « à valider ». */
export const afficher = (v) => {
  const t = Array.isArray(v) ? v.join(' ; ') : (v ?? '');
  return t === '' ? A_VALIDER : t;
};

/** Champs comparés dans le panneau « En commun / Différences ». */
export const champs = [
  { libelle: 'Voie', valeur: (m) => afficher(voieParId[m.voieId]?.nom) },
  { libelle: 'Cible', valeur: (m) => afficher(cibleParId[m.cibleId]?.nom) },
  { libelle: 'Classe', valeur: (m) => afficher(m.classe) },
  { libelle: 'Structure', valeur: (m) => afficher(m.structure) },
  { libelle: 'Administration', valeur: (m) => afficher(m.administration) }
];
