/**
 * Signaux et nœuds éteints par un ensemble de cibles bloquées.
 * - une arête est éteinte si l'une de ses cibles est bloquée, ou si son nœud d'origine est éteint ;
 * - un nœud est éteint s'il est lui-même ciblé, si une arête entrante « requise » est éteinte,
 *   ou si toutes ses arêtes entrantes le sont.
 */
export function eteindre(carte, cibleIds) {
  const bloquees = new Set(cibleIds);
  const touche = (x) => (x.cibleIds ?? []).some((id) => bloquees.has(id));
  const aretes = new Set(carte.aretes.filter(touche).map((a) => a.id));
  const noeuds = new Set(carte.noeuds.filter(touche).map((n) => n.id));
  let change = true;
  while (change) {
    change = false;
    for (const a of carte.aretes) {
      if (!aretes.has(a.id) && noeuds.has(a.de)) { aretes.add(a.id); change = true; }
    }
    for (const n of carte.noeuds) {
      if (noeuds.has(n.id)) continue;
      const entrantes = carte.aretes.filter((a) => a.vers === n.id);
      if (!entrantes.length) continue;
      if (entrantes.some((a) => a.requis && aretes.has(a.id)) || entrantes.every((a) => aretes.has(a.id))) {
        noeuds.add(n.id);
        change = true;
      }
    }
  }
  return { aretes, noeuds };
}

/** Géométrie d'une arête : courbe de Bézier du bord droit de l'origine au bord gauche de la destination. */
export function trace(a, de, vers, hw) {
  const dy = a.dy ?? 0;
  const x1 = de.x + hw(de), y1 = de.y + dy, x2 = vers.x - hw(vers) - 5, y2 = vers.y + dy;
  const c = (x2 - x1) / 2;
  const p = [[x1, y1], [x1 + c, y1], [x2 - c, y2], [x2, y2]];
  const t = a.pos ?? 0.5, u = 1 - t;
  const pt = (i) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i];
  return { d: `M${x1} ${y1}C${x1 + c} ${y1} ${x2 - c} ${y2} ${x2} ${y2}`, mx: pt(0), my: pt(1) };
}
