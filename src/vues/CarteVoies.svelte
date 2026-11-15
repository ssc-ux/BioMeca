<script>
  import { etat, hash, ajouter } from '../lib/selection.svelte.js';
  import { carte, moleculeParId, cibleParId, molecules } from '../lib/data.js';
  import { eteindre, trace } from '../lib/carte.js';
  import { couleur } from '../lib/couleurs.js';
  import Recherche from '../composants/Recherche.svelte';
  import Puces from '../composants/Puces.svelte';

  const [largeur, hauteur] = carte.viewBox.split(' ').slice(2).map(Number);
  const noeud = Object.fromEntries(carte.noeuds.map((n) => [n.id, n]));
  const lignes = (t) => t.split('\n');
  const hw = (n) => n.hw ?? 92;
  const HH = 27;
  const teinte = { inne: '#0b5c6b', t: '#1d4ed8', b: '#6d28d9' };
  const plat = (t) => t.replace(/\n/g, ' ');

  const mols = $derived(etat.ids.map((id) => moleculeParId[id]));
  const off = $derived(eteindre(carte, mols.map((m) => m.cibleId)));
  const sur = (x) => mols.filter((m) => (x.cibleIds ?? []).includes(m.cibleId));
  const disponibles = (x) => molecules.filter((m) => (x.cibleIds ?? []).includes(m.cibleId));
  // Cible vers laquelle mène un clic : la cible propre au signal, avant JAK (commune à plusieurs signaux).
  const lien = (x) => { const id = (x.cibleIds ?? []).find((c) => c !== 'jak') ?? (x.cibleIds ?? [])[0]; return id ? hash('/cible/' + id) : null; };
  const aller = (x) => { const h = lien(x); if (h) location.hash = h; };
  const largeurPastille = (a) => a.label.length * 6.7 + 20 + sur(a).length * 11;
  const aretes = $derived(carte.aretes.map((a) => ({ ...a, ...trace(a, noeud[a.de], noeud[a.vers], hw) })));

  let bulle = $state(null);
  const bulleNoeud = (n) => ({ cle: n.id, titre: plat(n.label), texte: n.info, x: n.x, haut: n.y - HH, bas: n.y + HH, cible: n });
  const bulleArete = (a) => ({ cle: a.id, titre: a.label, sous: `${plat(noeud[a.de].label)} → ${plat(noeud[a.vers].label)}`, texte: a.info, x: a.mx, haut: a.my - 13, bas: a.my + 13, cible: a });
  const style = $derived.by(() => {
    if (!bulle) return '';
    const dessous = (bulle.haut + bulle.bas) / 2 < hauteur * 0.5;
    const px = (bulle.x / largeur) * 100;
    const tx = px < 25 ? '-10%' : px > 75 ? '-90%' : '-50%';
    return `left:${px}%;top:${((dessous ? bulle.bas : bulle.haut) / hauteur) * 100}%;transform:translate(${tx},${dessous ? '10px' : 'calc(-100% - 10px)'})`;
  });

  const bilan = $derived(mols.map((m) => ({
    m,
    signaux: carte.aretes.filter((a) => a.cibleIds.includes(m.cibleId)),
    cellules: carte.noeuds.filter((n) => (n.cibleIds ?? []).includes(m.cibleId))
  })));
</script>

<div class="vue">
  <header>
    <h1>Carte des voies</h1>
    <p>Vue d'ensemble de la réponse immunitaire : cellules, signaux qu'elles échangent, effets. Ajoutez un médicament pour voir les signaux qu'il éteint et ce qui s'arrête en aval. Les étiquettes cerclées sont des cibles thérapeutiques : cliquez pour ouvrir la cible.</p>
  </header>

  <Recherche exclus={etat.ids} onchoisir={ajouter} />
  <Puces lienMecanisme />

  <section class="carte bloc">
    <div class="defilement">
      <div class="cadre">
        <svg viewBox={carte.viewBox} role="group" aria-label="Carte de la réponse immunitaire et des signaux bloqués par les médicaments sélectionnés">
          <defs>
            <marker id="c-fleche" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#475569" /></marker>
            <marker id="c-fleche-off" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#cbd5e1" /></marker>
          </defs>

          {#each carte.titres as t}
            <text class="titre" x={t.x} y="26" text-anchor="middle">{t.texte}</text>
          {/each}
          <path class="filet" d="M28 40H{largeur - 28}" />

          {#each aretes as a (a.id)}
            <path class="arete" class:eteinte={off.aretes.has(a.id)} d={a.d} marker-end="url(#{off.aretes.has(a.id) ? 'c-fleche-off' : 'c-fleche'})" />
          {/each}

          {#each carte.noeuds as n (n.id)}
            {@const b = bulleNoeud(n)}
            {@const cx = n.type === 'cellule' ? n.x - hw(n) + 30 : n.x}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <g class="z" class:lien={lien(n)} class:eteint={off.noeuds.has(n.id)} tabindex="0" role={lien(n) ? 'link' : 'img'}
              aria-label="{b.titre} : {n.info}{lien(n) ? ' Ouvrir la cible.' : ''}"
              onmouseenter={() => (bulle = b)} onmouseleave={() => (bulle = null)} onfocus={() => (bulle = b)} onblur={() => (bulle = null)}
              onclick={() => aller(n)} onkeydown={(e) => e.key === 'Enter' && aller(n)}>
              <rect class="carte-n {n.type}" class:ciblable={n.cibleIds} x={n.x - hw(n)} y={n.y - HH} width={hw(n) * 2} height={HH * 2} rx="10" />
              {#if n.type === 'cellule'}<circle class="famille" cx={n.x - hw(n) + 16} cy={n.y} r="6" fill={teinte[n.famille]} />{/if}
              <text class="nom" x={cx} y={n.y - (lignes(n.label).length - 1) * 7.5 + 4.5} text-anchor={n.type === 'cellule' ? 'start' : 'middle'}>
                {#each lignes(n.label) as l, k}<tspan x={cx} dy={k ? 15 : 0}>{l}</tspan>{/each}
              </text>
              {#each sur(n) as m, k (m.id)}<circle cx={n.x + hw(n) - 12 - k * 11} cy={n.y - HH + 11} r="4.5" fill={couleur(m.id)} />{/each}
            </g>
          {/each}

          {#each aretes as a (a.id)}
            {@const b = bulleArete(a)}
            {@const w = largeurPastille(a)}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <g class="z" class:lien={lien(a)} class:eteint={off.aretes.has(a.id)} tabindex="0" role={lien(a) ? 'link' : 'img'}
              aria-label="{b.titre}, {b.sous} : {a.info}{lien(a) ? ' Ouvrir la cible.' : ''}"
              onmouseenter={() => (bulle = b)} onmouseleave={() => (bulle = null)} onfocus={() => (bulle = b)} onblur={() => (bulle = null)}
              onclick={() => aller(a)} onkeydown={(e) => e.key === 'Enter' && aller(a)}>
              <rect class="pastille-a" class:ciblable={a.cibleIds.length} x={a.mx - w / 2} y={a.my - 12} width={w} height="24" rx="12" />
              <text class="lib" x={a.mx - w / 2 + 10} y={a.my + 4}>{a.label}</text>
              {#each sur(a) as m, k (m.id)}<circle cx={a.mx + w / 2 - 11 - k * 11} cy={a.my} r="4.5" fill={couleur(m.id)} />{/each}
            </g>
          {/each}
        </svg>

        {#if bulle}
          <div class="bulle" role="tooltip" {style}>
            <p class="t">{bulle.titre}</p>
            {#if bulle.sous}<p class="s">{bulle.sous}</p>{/if}
            <p>{bulle.texte}</p>
            {#if disponibles(bulle.cible).length}
              <p class="m">Médicaments : {disponibles(bulle.cible).map((m) => m.dci).join(', ')}</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <ul class="legende">
      <li><span class="ic actif"></span>Signal actif</li>
      <li><span class="ic coupe"></span>Signal éteint par un médicament sélectionné</li>
      <li><span class="ic cible"></span>Cible thérapeutique (cliquable)</li>
      <li><span class="ic point"></span>Médicament sélectionné agissant ici</li>
    </ul>
  </section>

  {#if bilan.length}
    <section class="carte bloc">
      <h2>Ce que les médicaments sélectionnés éteignent</h2>
      <ul class="bilan">
        {#each bilan as b (b.m.id)}
          <li>
            <span class="pastille" style:background={couleur(b.m.id)}></span>
            <span>
              <strong style:color={couleur(b.m.id)}>{b.m.dci}</strong> bloque <a class="lien" href={hash('/cible/' + b.m.cibleId)}>{cibleParId[b.m.cibleId].nom}</a> :
              {#each b.cellules as n}déplétion de « {plat(n.label)} »{b.signaux.length ? ' ; ' : ''}{/each}
              {#each b.signaux as a, k}{k ? ' ; ' : ''}{a.label} ({plat(noeud[a.de].label)} → {plat(noeud[a.vers].label)}){/each}.
            </span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>

<style>
  .defilement { overflow-x: auto; }
  .cadre { position: relative; min-width: 980px; }
  svg { display: block; width: 100%; height: auto; font-size: 13px; background: #fbfcfe; border: 1px solid var(--bord); border-radius: 10px; }
  .titre { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; fill: #475569; }
  .filet { stroke: #d8e0e8; }

  .arete { fill: none; stroke: #475569; stroke-width: 1.8; transition: stroke 0.2s; }
  .arete.eteinte { stroke: #cbd5e1; stroke-dasharray: 4 6; }

  .z { cursor: default; outline: none; transition: opacity 0.2s; }
  .z.lien { cursor: pointer; }
  .carte-n { fill: #fff; stroke: #b6c2d1; stroke-width: 1.3; }
  .carte-n.effet { fill: #e9f4f5; stroke: #0b5c6b; }
  .carte-n.ciblable { stroke: #0b5c6b; stroke-width: 2.4; }
  .nom { fill: #0f172a; font-weight: 500; }
  .pastille-a { fill: #fff; stroke: #b6c2d1; stroke-width: 1.2; }
  .pastille-a.ciblable { stroke: #0b5c6b; stroke-width: 2.2; }
  .lib { fill: #0f172a; font-size: 12.5px; font-weight: 600; }

  .z.eteint .carte-n { fill: #f1f5f9; stroke: #cbd5e1; stroke-dasharray: 4 3; }
  .z.eteint .nom { fill: #94a3b8; }
  .z.eteint .famille { opacity: 0.35; }
  .z.eteint .pastille-a { fill: #fff1f2; stroke: #be123c; }
  .z.eteint .lib { fill: #9f1239; text-decoration: line-through; }
  .z:hover .carte-n, .z:focus-visible .carte-n, .z:hover .pastille-a, .z:focus-visible .pastille-a { stroke: #f59e0b; stroke-width: 3; stroke-dasharray: none; }

  .bulle {
    position: absolute; z-index: 5; width: max-content; max-width: min(320px, 60%);
    padding: 10px 12px; border-radius: 8px; background: #0f172a; color: #f8fafc;
    font-size: 13.5px; line-height: 1.45; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.28); pointer-events: none;
  }
  .bulle .t { font-weight: 700; font-size: 14px; color: #fde68a; }
  .bulle .s { font-size: 12px; color: #cbd5e1; margin-bottom: 4px; }
  .bulle .m { margin-top: 6px; font-size: 12.5px; color: #a5f3fc; }

  .legende { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 12px; font-size: 13px; color: var(--encre-2); }
  .legende li { display: flex; align-items: center; gap: 8px; }
  .ic { display: inline-block; flex: none; }
  .actif { width: 26px; border-top: 2px solid #475569; }
  .coupe { width: 26px; border-top: 2px dashed #cbd5e1; }
  .cible { width: 30px; height: 14px; border-radius: 7px; border: 2.2px solid #0b5c6b; }
  .point { width: 10px; height: 10px; border-radius: 50%; background: #1d4ed8; }

  .bilan { display: flex; flex-direction: column; gap: 8px; font-size: 14.5px; }
  .bilan li { display: flex; gap: 8px; align-items: baseline; }
</style>
