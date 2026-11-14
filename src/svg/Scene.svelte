<script>
  import Membrane from './Membrane.svelte';
  import Recepteur from './Recepteur.svelte';
  import Cytokine from './Cytokine.svelte';
  import Kinase from './Kinase.svelte';
  import Noyau from './Noyau.svelte';
  import Anticorps from './Anticorps.svelte';
  import Inhibiteur from './Inhibiteur.svelte';
  import { couleur } from '../lib/couleurs.js';
  import { cibleParId } from '../lib/data.js';

  let { voie, placements = [], actifs = null, bloques = new Set(), surligne = null } = $props();

  const types = { membrane: Membrane, recepteur: Recepteur, cytokine: Cytokine, kinase: Kinase, noyau: Noyau };
  const scene = $derived(voie.scene);
  const largeur = $derived(Number(scene.viewBox.split(' ')[2]));
  const parId = $derived(Object.fromEntries(scene.elements.map((e) => [e.id, e])));
  const inactif = (id) => actifs !== null && !actifs.includes(id);
  const description = $derived(
    `Schéma de la ${voie.nom} : ` + scene.elements.filter((e) => e.type !== 'membrane').map((e) => e.label).join(', ') +
      (placements.length ? '. Médicaments fixés : ' + placements.map((p) => `${p.mol.dci} sur ${parId[cibleParId[p.mol.cibleId].ancre.elementId].label}`).join(', ') : '') +
      (bloques.size ? '. Bloqués en aval : ' + [...bloques].map((id) => parId[id].label).join(', ') : '') + '.'
  );
</script>

<svg viewBox={scene.viewBox} role="img" aria-label={description}>
  {#each scene.elements.filter((e) => e.type === 'membrane') as e (e.id)}
    <Membrane {...e} {largeur} />
  {/each}

  {#each scene.liens as [a, b]}
    <line
      class="lien" class:bloque={bloques.has(b)} class:inactif={inactif(a) || inactif(b)}
      x1={parId[a].x} y1={parId[a].y} x2={parId[b].x} y2={parId[b].y}
    />
  {/each}

  {#each scene.elements.filter((e) => e.type !== 'membrane') as e (e.id)}
    {@const C = types[e.type]}
    <g class="el" class:bloque={bloques.has(e.id)} class:inactif={inactif(e.id)} class:surligne={surligne?.id === e.id}>
      <C {...e} />
    </g>
  {/each}

  {#each placements as p (p.mol.id)}
    <g class="med">
      {#if p.mol.glyphe === 'inhibiteur'}
        <Inhibiteur x={p.x} y={p.y} angle={p.angle} couleur={couleur(p.mol.id)} />
      {:else}
        <Anticorps x={p.x} y={p.y} angle={p.angle} couleur={couleur(p.mol.id)} fusion={p.mol.glyphe === 'fusion'} />
      {/if}
      <text class="nom" x={p.lx} y={p.ly} text-anchor={p.ancrage} fill={couleur(p.mol.id)}>{p.mol.dci}</text>
    </g>
  {/each}
</svg>

<style>
  svg { display: block; width: 100%; height: auto; font-size: 13px; fill: #0f172a; }
  .lien { stroke: #64748b; stroke-width: 2; transition: opacity 0.2s; }
  .lien.bloque { stroke-dasharray: 3 6; opacity: 0.45; }
  .el { transition: opacity 0.2s; }
  .inactif { opacity: 0.22; }
  .el.bloque { opacity: 0.35; }
  .el.bloque :global(.forme) { stroke-dasharray: 4 3; }
  .el.surligne { opacity: 1; }
  .el.surligne :global(.forme) { stroke: #c2410c; stroke-width: 4; stroke-dasharray: none; }
  .nom { font-weight: 600; paint-order: stroke; stroke: #fff; stroke-width: 3px; }
  .med { animation: apparition 0.25s ease-out; }
  @keyframes apparition { from { opacity: 0; } to { opacity: 1; } }
</style>
