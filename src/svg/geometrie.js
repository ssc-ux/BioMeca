// Dimensions des éléments du schéma, partagées par les composants et le tracé des liens.
const lignes = (label) => label.split('\n');

export function taille(e) {
  const label = e.label ?? '';
  switch (e.type) {
    case 'cytokine': { const r = Math.max(18, label.length * 3.3 + 5); return { forme: 'ellipse', hw: r, hh: r }; }
    case 'recepteur': return { forme: 'rect', hw: 11, hh: 33 };
    case 'kinase': return { forme: 'rect', hw: Math.max(54, label.length * 7 + 18) / 2, hh: 12 };
    case 'noyau': return { forme: 'ellipse', hw: Math.max(120, label.length * 3.3 + 16), hh: 22 };
    case 'boite': {
      const l = lignes(label);
      return { forme: 'rect', hw: Math.max(60, Math.max(...l.map((x) => x.length)) * 6.6 + 18) / 2, hh: (l.length * 15 + 12) / 2 };
    }
    case 'groupe': return { forme: 'rect', hw: e.w / 2, hh: e.h / 2 };
    default: return { forme: 'rect', hw: 0, hh: 0 };
  }
}

// Fraction du segment a→b occupée par l'élément e à son extrémité.
function sortie(e, dx, dy) {
  const s = taille(e);
  if (s.forme === 'ellipse') return 1 / Math.hypot(dx / s.hw, dy / s.hh);
  return Math.min(dx ? s.hw / Math.abs(dx) : Infinity, dy ? s.hh / Math.abs(dy) : Infinity);
}

/** Segment reliant les bords de deux éléments (et non leurs centres), pour y poser une pointe de flèche. */
export function segment(a, b, marge = 4) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ta = Math.min(sortie(a, dx, dy), 0.45);
  const tb = Math.min(sortie(b, dx, dy), 0.45) + marge / len;
  return { x1: a.x + dx * ta, y1: a.y + dy * ta, x2: b.x - dx * tb, y2: b.y - dy * tb };
}
