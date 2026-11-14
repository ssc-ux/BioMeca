<script>
  import { cibleParId, A_VALIDER, afficher } from '../lib/data.js';
  import { placer, bloquesPar } from '../lib/groupes.js';
  import { couleur } from '../lib/couleurs.js';
  import Scene from '../svg/Scene.svelte';

  let { voie, mols } = $props();

  let i = $state(0);
  let survol = $state(null);
  let epingle = $state(null);

  const n = $derived(voie.etapes.length);
  const etape = $derived(voie.etapes[Math.min(i, n - 1)]);
  const medicaments = $derived(etape.phase !== 'physiologie');
  const placements = $derived(placer(mols, cibleParId));
  const cibles = $derived([...new Set(mols.map((m) => cibleParId[m.cibleId]))]);
  const bloques = $derived(etape.phase === 'aval' ? bloquesPar(cibles, voie.scene.liens) : new Set());
  const surligne = $derived(survol ?? epingle);
  const libelle = (id) => voie.scene.elements.find((e) => e.id === id)?.label ?? id;

  const phases = { physiologie: 'Voie physiologique', fixation: 'Fixation du médicament', aval: 'Conséquences en aval' };
</script>

<section class="carte panneau" aria-labelledby="titre-{voie.id}">
  <header>
    <h2 id="titre-{voie.id}">{voie.nom}</h2>
    <ul class="legende" aria-label="Molécules de cette voie">
      {#each mols as m (m.id)}
        <li><span class="pastille" style:background={couleur(m.id)}></span>{m.dci}</li>
      {/each}
    </ul>
  </header>

  <div class="schema">
    <Scene {voie} placements={medicaments ? placements : []} actifs={etape.actifs ?? null} {bloques} {surligne} />
  </div>

  <div class="etape" aria-live="polite">
    <p class="phase">{phases[etape.phase]} · étape {i + 1} sur {n}</p>
    <h3>{etape.titre}</h3>
    <p class:a-valider={!etape.texte}>{afficher(etape.texte)}</p>
    {#if etape.phase === 'fixation'}
      <ul class="mecanismes">
        {#each mols as m (m.id)}
          <li>
            <span class="pastille" style:background={couleur(m.id)}></span>
            <span><strong style:color={couleur(m.id)}>{m.dci}</strong> : <span class:a-valider={!m.mecanisme}>{afficher(m.mecanisme)}</span></span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="pas">
    <button class="bouton" disabled={i === 0} onclick={() => (i -= 1)}><span aria-hidden="true">←</span> Précédent</button>
    <ol class="points" aria-hidden="true">
      {#each voie.etapes as e, k}
        <li class:fait={k <= i} class:courant={k === i}></li>
      {/each}
    </ol>
    <button class="bouton primaire" disabled={i >= n - 1} onclick={() => (i += 1)}>Suivant <span aria-hidden="true">→</span></button>
  </div>

  <div class="effets">
    <h3>Du mécanisme à l'effet indésirable</h3>
    <p class="aide">Survolez ou cliquez un effet pour repérer sur le schéma l'élément en cause.</p>
    {#each mols as m (m.id)}
      {@const cible = cibleParId[m.cibleId]}
      <details class="molecule" open={mols.length <= 2}>
        <summary>
          <span class="pastille" style:background={couleur(m.id)}></span>
          <span style:color={couleur(m.id)}>{m.dci}</span>
          <span class="bloque">cible bloquée : {cible.nom} · {m.effets.length} effet{m.effets.length > 1 ? 's' : ''}</span>
        </summary>
        {#if m.effets.length}
          <ul>
            {#each m.effets as e, k}
              {@const el = e.elementId ?? cible.ancre.elementId}
              {@const cle = m.id + k}
              <li>
                <button
                  class="effet"
                  aria-pressed={epingle?.cle === cle}
                  onmouseenter={() => (survol = { cle, id: el })}
                  onmouseleave={() => (survol = null)}
                  onfocus={() => (survol = { cle, id: el })}
                  onblur={() => (survol = null)}
                  onclick={() => (epingle = epingle?.cle === cle ? null : { cle, id: el })}
                >
                  <span class="nom">{e.effet}</span>
                  <span class="meca" class:a-valider={!e.mecanisme}>{e.mecanisme || 'Mécanisme : ' + A_VALIDER}</span>
                  <span class="lieu">Sur le schéma : {libelle(el)}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="a-valider">Effets et mécanismes : {A_VALIDER}</p>
        {/if}
        <p class="source">
          Source : <span class:a-valider={!m.source}>{afficher(m.source)}</span> · Mise à jour : <span class:a-valider={!m.dateMaj}>{afficher(m.dateMaj)}</span>
          {#if m.statut}<span class="badge">{m.statut}</span>{/if}
        </p>
      </details>
    {/each}
  </div>
</section>

<style>
  .panneau { flex: 1 1 420px; min-width: 0; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; }
  h2 { font-size: 18px; }
  .legende { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 14px; }
  .legende li { display: flex; align-items: center; gap: 6px; }
  .etape { min-height: 104px; }
  .phase { font-size: 13px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.04em; }
  h3 { font-size: 16px; margin: 2px 0 4px; }
  .etape p { font-size: 15px; }
  .mecanismes { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
  .mecanismes li { display: flex; gap: 8px; align-items: baseline; }
  .pas { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .pas .bouton { white-space: nowrap; }
  .points { display: flex; gap: 6px; margin: 0; padding: 0; list-style: none; }
  .points li { width: 10px; height: 10px; border-radius: 50%; background: var(--bord); }
  .points li.fait { background: var(--accent); }
  .points li.courant { width: 26px; border-radius: 5px; }
  @media (max-width: 480px) { .pas .bouton { padding: 0 12px; } .points { display: none; } }
  .effets { border-top: 1px solid var(--bord); padding-top: 14px; display: flex; flex-direction: column; gap: 10px; }
  .aide { font-size: 13px; color: var(--encre-2); }
  .schema { background: var(--surface); overflow-x: auto; }
  .schema :global(svg) { min-width: 460px; }
  @media (min-height: 700px) {
    .schema { position: sticky; top: 0; z-index: 2; border-bottom: 1px solid var(--bord); }
  }
  summary {
    min-height: 44px; padding: 4px 0; font-size: 15px; font-weight: 600; cursor: pointer;
    display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px;
  }
  summary::before { content: '▸'; color: var(--encre-2); }
  details[open] > summary::before { content: '▾'; }
  summary::-webkit-details-marker { display: none; }
  .bloque { font-weight: 400; font-size: 13px; color: var(--encre-2); }
  .molecule ul { display: flex; flex-direction: column; gap: 6px; }
  .effet {
    width: 100%; min-height: 44px; padding: 8px 12px; text-align: left;
    display: flex; flex-direction: column; gap: 2px;
    background: var(--fond); border: 1px solid transparent; border-radius: 8px;
  }
  .effet:hover, .effet:focus-visible { border-color: #b45309; background: #fff7ed; }
  .effet[aria-pressed='true'] { border-color: #b45309; background: #ffedd5; }
  .nom { font-weight: 600; font-size: 14px; }
  .meca { font-size: 14px; }
  .lieu { font-size: 12px; color: var(--encre-2); }
  .source { margin-top: 6px; font-size: 12px; color: var(--encre-2); }
  .source .badge { margin-left: 6px; }
</style>
