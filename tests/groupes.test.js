import { describe, it, expect } from 'vitest';
import { molecules, cibles, voies, maladies, carte, moleculeParId, cibleParId, voieParId, champs } from '../src/lib/data.js';
import { grouperParVoie, comparer, aval, bloquesPar, placer } from '../src/lib/groupes.js';

const sel = (...ids) => ids.map((id) => moleculeParId[id]);

describe('regroupement par voie', () => {
  it('tocilizumab + sarilumab = un seul schéma', () => {
    const g = grouperParVoie(sel('tocilizumab', 'sarilumab'));
    expect(g).toHaveLength(1);
    expect(g[0].molecules.map((m) => m.id)).toEqual(['tocilizumab', 'sarilumab']);
  });
  it('tocilizumab + rituximab = deux panneaux', () => {
    expect(grouperParVoie(sel('tocilizumab', 'rituximab')).map((g) => g.voieId)).toEqual(['il6', 'lb']);
  });
});

describe('comparaison', () => {
  it('ne liste en différences que les champs qui diffèrent', () => {
    const { commun, differences } = comparer(sel('tocilizumab', 'sarilumab'), champs);
    expect(commun.map((c) => c.libelle)).toEqual(['Voie', 'Cible', 'Classe']);
    expect(differences.map((d) => d.libelle)).toEqual(['Structure', 'Administration']);
  });
});

describe('schéma', () => {
  it('calcule les éléments en aval de la cible', () => {
    const a = aval(voieParId.il6.scene.liens, ['il6r']);
    for (const id of ['gp130', 'jak', 'stat3', 'noyau', 'e1']) expect(a.has(id), id).toBe(true);
    for (const id of ['source', 'il6', 'il6r']) expect(a.has(id), id).toBe(false);
  });
  it('utilise la liste explicite de la cible quand elle existe', () => {
    expect([...bloquesPar([cibleParId.cd20], voieParId.lb.scene.liens)]).toEqual(cibleParId.cd20.aval);
  });
  it('place deux molécules de même cible sur la même ancre, angles distincts', () => {
    const [a, b] = placer(sel('tocilizumab', 'sarilumab'), cibleParId);
    expect([a.x, a.y]).toEqual([b.x, b.y]);
    expect(a.angle).not.toBe(b.angle);
  });
});

describe('intégrité des données', () => {
  it('chaque maladie liste des molécules existantes dont les voies sont exactement ses voies', () => {
    for (const d of maladies) {
      for (const id of d.moleculeIds) expect(moleculeParId[id], d.id + ' ' + id).toBeDefined();
      expect([...new Set(d.moleculeIds.map((id) => moleculeParId[id].voieId))].sort(), d.id).toEqual([...d.voieIds].sort());
    }
  });
  it('la carte référence des stations, voies et cibles existantes, et couvre toutes les cibles', () => {
    const ids = carte.stations.map((s) => s.id);
    for (const l of carte.lignes) {
      expect(voieParId[l.voieId], l.voieId).toBeDefined();
      for (const t of l.trajets) for (const id of t) expect(ids, l.voieId).toContain(id);
    }
    const ciblees = carte.stations.filter((s) => s.cibleId).map((s) => s.cibleId);
    for (const id of ciblees) expect(cibleParId[id], id).toBeDefined();
    expect(ciblees.sort()).toEqual(cibles.map((c) => c.id).sort());
  });
  it('chaque molécule référence une cible et une voie cohérentes', () => {
    for (const m of molecules) {
      expect(cibleParId[m.cibleId], m.id).toBeDefined();
      expect(voieParId[m.voieId], m.id).toBeDefined();
      expect(cibleParId[m.cibleId].voieId).toBe(m.voieId);
    }
  });
  it('ancres, liens et étapes pointent sur des éléments existants de la scène', () => {
    const idsDe = (voieId) => voieParId[voieId].scene.elements.map((e) => e.id);
    for (const c of cibles) {
      expect(idsDe(c.voieId), c.id).toContain(c.ancre.elementId);
      for (const id of c.aval ?? []) expect(idsDe(c.voieId), c.id).toContain(id);
    }
    for (const v of voies) {
      for (const l of v.scene.liens) for (const id of l.slice(0, 2)) expect(idsDe(v.id), v.id).toContain(id);
      for (const e of v.etapes) for (const id of e.actifs ?? []) expect(idsDe(v.id), v.id).toContain(id);
    }
  });
});
