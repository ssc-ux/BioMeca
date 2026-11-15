<script>
  import Membrane from './Membrane.svelte';
  import Recepteur from './Recepteur.svelte';
  import Cytokine from './Cytokine.svelte';
  import Kinase from './Kinase.svelte';
  import Noyau from './Noyau.svelte';
  import Boite from './Boite.svelte';
  import Groupe from './Groupe.svelte';
  import Anticorps from './Anticorps.svelte';
  import Inhibiteur from './Inhibiteur.svelte';
  import { taille, segment } from './geometrie.js';
  import { couleur } from '../lib/couleurs.js';
  import { cibleParId, afficher } from '../lib/data.js';

  let { voie, placements = [], bloques = new Set(), surligne = null } = $props();

  const types = { membrane: Membrane, recepteur: Recepteur, cytokine: Cytokine, kinase: Kinase, noyau: Noyau, boite: Boite, groupe: Groupe };
  const FOND = ['membrane', 'groupe'];
  const plat = (t) => t.replace(/\n/g, ' ');
  const scene = $derived(voie.scene);
  const [largeur, hauteur] = $derived(scene.viewBox.split(' ').slice(2).map(Number));
  const parId = $derived(Object.fromEntries(scene.elements.map((e) => [e.id, e])));
  const uid = $derived('s-' + voie.id);

  // Info-bulle : une seule à la fois, ouverte au survol, au focus clavier ou au toucher.
  let bulle = $state(null);
  let epinglee = $state(false);
  const ouvrir = (b) => { if (!epinglee) bulle = b; };
  const fermer = () => { if (!epinglee) bulle = null; };
  function basculer(b) {
    if (epinglee && bulle?.cle === b.cle) { epinglee = false; bulle = null; } else { bulle = b; epinglee = true; }
  }
  const touche = (e, b) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); basculer(b); }
    if (e.key === 'Escape') { epinglee = false; bulle = null; }
  };

  const bulleElement = (e) => {
    const t = taille(e);
    return { cle: e.id, titre: plat(e.label) || 'Récepteur', texte: e.info, x: e.x, haut: e.y - t.hh, bas: e.y + t.hh };
  };
  const bulleMolecule = (p) => ({
    cle: 'm-' + p.mol.id, titre: p.mol.dci, sousTitre: afficher(p.mol.classe), texte: afficher(p.mol.mecanisme),
    couleur: couleur(p.mol.id), x: (p.x + p.lx) / 2, haut: Math.min(p.y, p.ly) - 14, bas: Math.max(p.y, p.ly) + 6
  });

  // Placement : sous l'élément dans la moitié haute du schéma, au-dessus sinon ; aligné selon la position horizontale.
  const style = $derived.by(() => {
    if (!bulle) return '';
    const dessous = (bulle.haut + bulle.bas) / 2 < hauteur * 0.5;
    const px = (bulle.x / largeur) * 100;
    const tx = px < 28 ? '-12%' : px > 72 ? '-88%' : '-50%';
    const top = ((dessous ? bulle.bas : bulle.haut) / hauteur) * 100;
    return `left:${px}%;top:${top}%;transform:translate(${tx},${dessous ? '10px' : 'calc(-100% - 10px)'})`;
  });

  const description = $derived(
    `Schéma de la ${voie.nom} : ` + scene.elements.filter((e) => !FOND.includes(e.type) && e.label).map((e) => plat(e.label)).join(', ') +
      (placements.length ? '. Médicaments fixés : ' + placements.map((p) => `${p.mol.dci} sur ${plat(parId[cibleParId[p.mol.cibleId].ancre.elementId].label)}`).join(', ') : '') +
      (bloques.size ? '. Bloqués en aval : ' + [...bloques].map((id) => plat(parId[id].label)).join(', ') : '') + '.'
  );
</script>

<div class="cadre">
  <svg viewBox={scene.viewBox} role="group" aria-label={description}>
    <defs>
      <marker id="{uid}-fleche" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill="#64748b" />
      </marker>
      <marker id="{uid}-frein" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M5 0V10" stroke="#be123c" stroke-width="3" />
      </marker>
    </defs>

    {#each scene.elements.filter((e) => e.type === 'membrane') as e (e.id)}
      <Membrane {...e} {largeur} {hauteur} />
    {/each}

    {#each scene.elements.filter((e) => e.type === 'groupe') as e (e.id)}
      {@const b = bulleElement(e)}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <g class="el fond" class:ouverte={bulle?.cle === e.id} tabindex="0" role="button" aria-label="{b.titre} : {e.info}"
        onmouseenter={() => ouvrir(b)} onmouseleave={fermer} onfocus={() => ouvrir(b)} onblur={fermer}
        onclick={() => basculer(b)} onkeydown={(ev) => touche(ev, b)}>
        <Groupe {...e} />
      </g>
    {/each}

    {#each scene.liens as [a, b, genre]}
      {@const s = segment(parId[a], parId[b])}
      <line class="lien" class:inhibe={genre === 'inhibe'} class:bloque={bloques.has(b) || bloques.has(a)}
        x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} marker-end="url(#{uid}-{genre === 'inhibe' ? 'frein' : 'fleche'})" />
    {/each}

    {#each scene.elements.filter((e) => !FOND.includes(e.type)) as e (e.id)}
      {@const C = types[e.type]}
      {@const b = bulleElement(e)}
      <g class="el" class:bloque={bloques.has(e.id)} class:ouverte={bulle?.cle === e.id} tabindex="0" role="button" aria-label="{b.titre} : {e.info}"
        onmouseenter={() => ouvrir(b)} onmouseleave={fermer} onfocus={() => ouvrir(b)} onblur={fermer}
        onclick={() => basculer(b)} onkeydown={(ev) => touche(ev, b)}>
        <C {...e} />
      </g>
    {/each}

    {#each placements as p (p.mol.id)}
      {@const b = bulleMolecule(p)}
      <g class="med" class:ouverte={bulle?.cle === b.cle || surligne === p.mol.id} tabindex="0" role="button" aria-label="{p.mol.dci} : {b.texte}"
        onmouseenter={() => ouvrir(b)} onmouseleave={fermer} onfocus={() => ouvrir(b)} onblur={fermer}
        onclick={() => basculer(b)} onkeydown={(ev) => touche(ev, b)}>
        <circle class="halo" cx={p.x + (p.lx - p.x) * 0.45} cy={p.y + (p.ly - p.y) * 0.45} r="24" />
        {#if p.mol.glyphe === 'inhibiteur'}
          <Inhibiteur x={p.x} y={p.y} angle={p.angle} couleur={couleur(p.mol.id)} />
        {:else}
          <Anticorps x={p.x} y={p.y} angle={p.angle} couleur={couleur(p.mol.id)} fusion={p.mol.glyphe === 'fusion'} />
        {/if}
        <text class="nom" x={p.lx} y={p.ly} text-anchor={p.ancrage} fill={couleur(p.mol.id)}>{p.mol.dci}</text>
      </g>
    {/each}
  </svg>

  {#if bulle}
    <div class="bulle" role="tooltip" {style}>
      <p class="titre" style:color={bulle.couleur}>{bulle.titre}</p>
      {#if bulle.sousTitre}<p class="sous">{bulle.sousTitre}</p>{/if}
      <p>{bulle.texte}</p>
    </div>
  {/if}
</div>

<style>
  .cadre { position: relative; }
  svg {
    display: block; width: 100%; height: auto; font-size: 13px; fill: #0f172a;
    border: 1px solid var(--bord); border-radius: 10px; background: #fffdf8;
  }
  .lien { stroke: #64748b; stroke-width: 1.8; transition: opacity 0.2s; }
  .lien.inhibe { stroke: #be123c; stroke-dasharray: 6 4; }
  .lien.bloque { stroke-dasharray: 3 6; opacity: 0.35; }

  .el, .med { cursor: pointer; outline: none; transition: opacity 0.2s; }
  .el.bloque { opacity: 0.32; }
  .el.bloque :global(.forme) { stroke-dasharray: 4 3; }
  .el:hover :global(.forme), .el:focus-visible :global(.forme), .el.ouverte :global(.forme) {
    stroke: #f59e0b; stroke-width: 3; stroke-dasharray: none;
  }
  .el.ouverte, .el:hover, .el:focus-visible { opacity: 1; }

  .halo { fill: #fde68a; opacity: 0; transition: opacity 0.15s; }
  .med:hover .halo, .med:focus-visible .halo, .med.ouverte .halo { opacity: 0.55; }
  .nom { font-weight: 700; paint-order: stroke; stroke: #fff; stroke-width: 3.5px; stroke-linejoin: round; }

  .bulle {
    position: absolute; z-index: 5; width: max-content; max-width: min(300px, 78%);
    padding: 10px 12px; border-radius: 8px; background: #0f172a; color: #f8fafc;
    font-size: 13.5px; line-height: 1.45; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.28); pointer-events: none;
  }
  .bulle .titre { font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #fde68a; }
  .bulle .titre[style] { background: #fff; display: inline-block; padding: 0 6px; border-radius: 4px; margin-bottom: 4px; }
  .bulle .sous { font-size: 12px; color: #cbd5e1; margin-bottom: 4px; }
</style>
