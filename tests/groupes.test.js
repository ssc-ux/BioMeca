import { describe, it, expect } from 'vitest';
import { molecules, cibles, voies, maladies, carte, moleculeParId, cibleParId, voieParId, champs } from '../src/lib/data.js';
import { grouperParVoie, comparer, aval, bloquesPar, placer } from '../src/lib/groupes.js';
import { eteindre } from '../src/lib/carte.js';

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

describe('carte : signaux éteints', () => {
  const off = (...ids) => eteindre(carte, sel(...ids).map((m) => m.cibleId));
  it('tocilizumab éteint les signaux de l’IL-6 sans éteindre les Th17', () => {
    const { aretes, noeuds } = off('tocilizumab');
    expect([...aretes].sort()).toEqual(['aide', 'il6', 'tfh6', 'th17a']);
    expect(noeuds.has('tfh')).toBe(true);
    expect(noeuds.has('lb')).toBe(false);
    expect(noeuds.has('sys')).toBe(true);
    expect(noeuds.has('th17')).toBe(false);
  });
  it('abatacept coupe le signal 2 : toute la différenciation T s’éteint', () => {
    const { noeuds } = off('abatacept');
    for (const id of ['tnaif', 'tcd8', 'ctl', 'th1', 'th17', 'th2', 'treg', 'neutro', 'eosino']) expect(noeuds.has(id), id).toBe(true);
    expect(noeuds.has('nk')).toBe(false);
    expect(noeuds.has('endo')).toBe(false);
  });
  it('rituximab éteint le lymphocyte B et la production d’anticorps', () => {
    const { noeuds } = off('rituximab');
    for (const id of ['lb', 'plasmo']) expect(noeuds.has(id), id).toBe(true);
  });
  it('aucun médicament du site n’éteint le complément ni les mastocytes', () => {
    const { noeuds } = eteindre(carte, cibles.map((c) => c.id));
    for (const id of ['c3', 'c5', 'mac', 'mast', 'allergie']) expect(noeuds.has(id), id).toBe(false);
  });
  it('sans sélection, rien n’est éteint', () => {
    const { aretes, noeuds } = off();
    expect(aretes.size + noeuds.size).toBe(0);
  });
});

describe('intégrité des données', () => {
  it('chaque maladie liste des molécules existantes dont les voies sont exactement ses voies', () => {
    for (const d of maladies) {
      for (const id of d.moleculeIds) expect(moleculeParId[id], d.id + ' ' + id).toBeDefined();
      expect([...new Set(d.moleculeIds.map((id) => moleculeParId[id].voieId))].sort(), d.id).toEqual([...d.voieIds].sort());
    }
  });
  it('la carte relie des nœuds existants et couvre toutes les cibles', () => {
    const ids = carte.noeuds.map((x) => x.id);
    for (const a of carte.aretes) {
      expect(ids, a.id).toContain(a.de);
      expect(ids, a.id).toContain(a.vers);
    }
    const ciblees = new Set([...carte.aretes, ...carte.noeuds].flatMap((x) => x.cibleIds ?? []));
    for (const id of ciblees) expect(cibleParId[id], id).toBeDefined();
    expect([...ciblees].sort()).toEqual(cibles.map((c) => c.id).sort());
  });
  it('chaque molécule référence une cible et une voie cohérentes', () => {
    for (const m of molecules) {
      expect(cibleParId[m.cibleId], m.id).toBeDefined();
      expect(voieParId[m.voieId], m.id).toBeDefined();
      expect(cibleParId[m.cibleId].voieId).toBe(m.voieId);
    }
  });
  it('ancres et liens pointent sur des éléments existants de la scène', () => {
    const idsDe = (voieId) => voieParId[voieId].scene.elements.map((e) => e.id);
    for (const c of cibles) {
      expect(idsDe(c.voieId), c.id).toContain(c.ancre.elementId);
      for (const id of c.aval ?? []) expect(idsDe(c.voieId), c.id).toContain(id);
    }
    for (const v of voies) {
      for (const l of v.scene.liens) for (const id of l.slice(0, 2)) expect(idsDe(v.id), v.id).toContain(id);
      for (const e of v.scene.elements) if (e.type !== 'membrane') expect(e.info, v.id + ' ' + e.id).toBeTruthy();
      expect(v.blocage, v.id).toBeTruthy();
    }
  });
});
