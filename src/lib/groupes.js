/** Regroupe les molécules par voie, dans l'ordre de première apparition. */
export function grouperParVoie(mols) {
  const groupes = [];
  for (const m of mols) {
    let g = groupes.find((x) => x.voieId === m.voieId);
    if (!g) groupes.push((g = { voieId: m.voieId, molecules: [] }));
    g.molecules.push(m);
  }
  return groupes;
}

/** Sépare les champs identiques (commun) de ceux qui diffèrent. */
export function comparer(mols, champs) {
  const commun = [];
  const differences = [];
  for (const c of champs) {
    const vals = mols.map((m) => c.valeur(m));
    if (vals.every((v) => v === vals[0])) commun.push({ libelle: c.libelle, valeur: vals[0] });
    else differences.push({ libelle: c.libelle, valeurs: mols.map((m, i) => ({ id: m.id, dci: m.dci, valeur: vals[i] })) });
  }
  return { commun, differences };
}

/** Éléments du schéma situés en aval des éléments de départ (liens orientés). */
export function aval(liens, departs) {
  const vus = new Set();
  const pile = [...departs];
  while (pile.length) {
    const a = pile.pop();
    for (const [de, vers] of liens) {
      if (de === a && !vus.has(vers)) {
        vus.add(vers);
        pile.push(vers);
      }
    }
  }
  return vus;
}

/** Éléments bloqués par un ensemble de cibles : liste explicite (cible.aval) ou aval calculé. */
export function bloquesPar(cibles, liens) {
  const out = new Set();
  for (const c of cibles) {
    for (const id of c.aval ?? aval(liens, [c.ancre.elementId])) out.add(id);
  }
  return out;
}

/** Place chaque molécule sur l'ancre de sa cible, en éventail si plusieurs partagent la cible. */
export function placer(mols, cibleParId) {
  const parCible = new Map();
  for (const m of mols) parCible.set(m.cibleId, [...(parCible.get(m.cibleId) ?? []), m]);
  const out = [];
  for (const [cibleId, liste] of parCible) {
    const a = cibleParId[cibleId].ancre;
    const n = liste.length;
    const pas = n > 1 ? Math.min(64, 120 / (n - 1)) : 0;
    liste.forEach((mol, i) => {
      const angle = (a.angle ?? 0) + (i - (n - 1) / 2) * pas;
      const r = (angle * Math.PI) / 180;
      const dx = Math.sin(r);
      const dy = -Math.cos(r);
      // Au-delà de 3 molécules, les libellés du centre sont éloignés pour ne pas se chevaucher.
      const L = 56 + (n > 3 ? 12 * (1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2)) : 0);
      out.push({
        mol, x: a.x, y: a.y, angle,
        lx: a.x + dx * L, ly: a.y + dy * L + 4,
        ancrage: dx > 0.2 ? 'start' : dx < -0.2 ? 'end' : 'middle'
      });
    });
  }
  return out;
}
