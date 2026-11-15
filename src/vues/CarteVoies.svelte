<script>
  import { etat, hash } from '../lib/selection.svelte.js';
  import { carte, moleculeParId, cibleParId, voieParId, molecules } from '../lib/data.js';
  import { couleur } from '../lib/couleurs.js';
  import Puces from '../composants/Puces.svelte';

  const st = Object.fromEntries(carte.stations.map((s) => [s.id, s]));
  const mols = $derived(etat.ids.map((id) => moleculeParId[id]));
  const voiesActives = $derived(new Set(mols.map((m) => m.voieId)));
  const eteinte = (voieId) => voiesActives.size > 0 && !voiesActives.has(voieId);
  const sur = (cibleId) => mols.filter((m) => m.cibleId === cibleId);
  const nb = (cibleId) => molecules.filter((m) => m.cibleId === cibleId).length;
  const points = (trajet) => trajet.map((id) => `${st[id].x},${st[id].y}`).join(' ');
  const lignes = (s) => s.label.split('\n');
  // Ordonnée de la première ligne du libellé, au-dessus ou au-dessous de la station.
  const y0 = (s) => (s.haut ? s.y - 22 - (lignes(s).length - 1) * 14 : s.y + 30);
</script>

<div class="vue">
  <header>
    <h1>Carte des voies</h1>
    <p>Chaque ligne est une voie, de la cellule productrice jusqu'au noyau. Les stations cerclées en gras sont des cibles thérapeutiques : cliquez sur l'une d'elles pour voir les molécules qui agissent dessus. Les molécules sélectionnées s'affichent sur leur station.</p>
  </header>

  <Puces lienMecanisme />

  <section class="carte bloc">
    <div class="defilement">
      <svg viewBox={carte.viewBox} role="group" aria-label="Carte des voies ciblées par les biothérapies">
        {#each carte.zones as z, k}
          <rect x={z.x} y="0" width={z.w} height="520" fill={k % 2 ? '#ffffff' : '#f4f7fa'} />
          <text class="zone" x={z.x + z.w / 2} y="24" text-anchor="middle">{z.nom}</text>
        {/each}

        {#each carte.lignes as l (l.voieId)}
          <g class="ligne" class:eteinte={eteinte(l.voieId)} transform="translate(0,{l.decalage})">
            {#each l.trajets as t}
              <polyline points={points(t)} stroke={l.couleur} />
            {/each}
          </g>
        {/each}

        {#each carte.stations as s (s.id)}
          {#if s.cibleId}
            {@const presentes = sur(s.cibleId)}
            <a href={hash('/cible/' + s.cibleId)} aria-label="{cibleParId[s.cibleId].nom} : {nb(s.cibleId)} molécule(s). Voir la cible.">
              <circle class="station cible" class:allumee={presentes.length} cx={s.x} cy={s.y} r="14" />
              <text class="nom gras" x={s.x + (s.dx ?? 0)} y={y0(s)} text-anchor="middle">
                {#each lignes(s) as t, k}<tspan x={s.x + (s.dx ?? 0)} dy={k ? 14 : 0}>{t}</tspan>{/each}
              </text>
              {#each presentes as m, k (m.id)}
                <text class="mol" x={s.x} y={s.haut ? y0(s) - 15 - k * 14 : y0(s) + lignes(s).length * 14 + k * 14} text-anchor="middle" fill={couleur(m.id)}>{m.dci}</text>
              {/each}
            </a>
          {:else}
            <circle class="station" cx={s.x} cy={s.y} r="9" />
            <text class="nom" x={s.x + (s.dx ?? 0)} y={y0(s)} text-anchor="middle">
              {#each lignes(s) as t, k}<tspan x={s.x + (s.dx ?? 0)} dy={k ? 14 : 0}>{t}</tspan>{/each}
            </text>
          {/if}
        {/each}
      </svg>
    </div>

    <ul class="legende">
      {#each carte.lignes as l (l.voieId)}
        <li class:eteinte={eteinte(l.voieId)}><span class="trait" style:background={l.couleur}></span>{voieParId[l.voieId].nom}</li>
      {/each}
      <li><span class="rond"></span>Cible thérapeutique (cliquable)</li>
    </ul>
  </section>
</div>

<style>
  .defilement { overflow-x: auto; }
  svg { display: block; width: 100%; min-width: 760px; height: auto; font-size: 13px; }
  .zone { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; fill: #475569; }
  polyline { fill: none; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; }
  .ligne, .legende li { transition: opacity 0.2s; }
  .eteinte { opacity: 0.25; }
  .station { fill: #fff; stroke: #0f172a; stroke-width: 3; }
  .station.cible { stroke-width: 5; }
  .station.allumee { fill: #fde68a; }
  a:hover .station, a:focus-visible .station { fill: #fde68a; }
  a:focus-visible { outline: none; }
  a:focus-visible .station { stroke: #1d4ed8; }
  .nom, .mol { paint-order: stroke; stroke: #fff; stroke-width: 4px; stroke-linejoin: round; }
  .nom { fill: #0f172a; }
  .gras { font-weight: 700; text-decoration: underline; }
  .mol { font-size: 12px; font-weight: 700; }
  .legende { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 14px; font-size: 14px; }
  .legende li { display: flex; align-items: center; gap: 8px; }
  .trait { width: 28px; height: 7px; border-radius: 4px; }
  .rond { width: 16px; height: 16px; border-radius: 50%; border: 4px solid #0f172a; }
</style>
