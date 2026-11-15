<script>
  import { cibleParId, afficher } from '../lib/data.js';
  import { placer, bloquesPar } from '../lib/groupes.js';
  import { couleur } from '../lib/couleurs.js';
  import Scene from '../svg/Scene.svelte';

  let { voie, mols } = $props();

  let i = $state(0);
  const n = $derived(voie.etapes.length);
  const etape = $derived(voie.etapes[Math.min(i, n - 1)]);
  const medicaments = $derived(etape.phase !== 'physiologie');
  const placements = $derived(placer(mols, cibleParId));
  const cibles = $derived([...new Set(mols.map((m) => cibleParId[m.cibleId]))]);
  const bloques = $derived(etape.phase === 'aval' ? bloquesPar(cibles, voie.scene.liens) : new Set());

  const phases = { physiologie: 'Voie physiologique', fixation: 'Médicament', aval: 'Médicament' };
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

  <div class="corps">
    <div class="schema">
      <Scene {voie} placements={medicaments ? placements : []} actifs={etape.actifs ?? null} {bloques} />
    </div>

    <div class="recit">
      <ol class="etapes">
        {#each voie.etapes as e, k (e.id)}
          {#if k === 0 || voie.etapes[k - 1].phase === 'physiologie' && e.phase !== 'physiologie'}
            <li class="phase" aria-hidden="true">{phases[e.phase]}</li>
          {/if}
          <li>
            <button class="etape" class:courante={k === i} class:faite={k < i} aria-current={k === i ? 'step' : undefined} onclick={() => (i = k)}>
              <span class="num">{k + 1}</span>{e.titre}
            </button>
            {#if k === i}
              <div class="texte" aria-live="polite">
                <p class:a-valider={!e.texte}>{afficher(e.texte)}</p>
                {#if e.ref}<p class="ref">Référence : {e.ref}</p>{/if}
                {#if e.phase === 'fixation'}
                  <ul class="mecanismes">
                    {#each mols as m (m.id)}
                      <li>
                        <span class="pastille" style:background={couleur(m.id)}></span>
                        <span><strong style:color={couleur(m.id)}>{m.dci}</strong> : <span class:a-valider={!m.mecanisme}>{afficher(m.mecanisme)}</span>{#if m.refMecanisme} <span class="ref">({m.refMecanisme})</span>{/if}</span>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ol>

      <div class="pas">
        <button class="bouton" disabled={i === 0} onclick={() => (i -= 1)}><span aria-hidden="true">←</span> Précédent</button>
        <span class="compte">Étape {i + 1} sur {n}</span>
        <button class="bouton primaire" disabled={i >= n - 1} onclick={() => (i += 1)}>Suivant <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </div>
</section>

<style>
  .panneau { flex: 1 1 520px; min-width: 0; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; }
  h2 { font-size: 18px; }
  .legende { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 14px; }
  .legende li { display: flex; align-items: center; gap: 6px; }

  .corps { display: flex; flex-wrap: wrap; gap: 20px 28px; align-items: flex-start; }
  .schema { flex: 3 1 440px; min-width: 0; max-width: 820px; overflow-x: auto; }
  .schema :global(svg) { min-width: 520px; }
  .recit { flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 14px; }

  .etapes { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 2px; }
  .phase {
    margin-top: 10px; padding: 0 0 4px; font-size: 12px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--encre-2);
  }
  .phase:first-child { margin-top: 0; }
  .etape {
    width: 100%; min-height: 44px; padding: 6px 10px; text-align: left;
    display: flex; align-items: center; gap: 10px;
    background: none; border: 0; border-radius: 8px; font-size: 15px; color: var(--encre-2);
  }
  .etape:hover { background: var(--fond); }
  .etape.courante { background: var(--accent-clair); color: var(--encre); font-weight: 600; }
  .num {
    flex: none; width: 26px; height: 26px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    border: 2px solid var(--bord-fort); font-size: 13px; font-weight: 600; background: var(--surface);
  }
  .faite .num { border-color: var(--accent); color: var(--accent); }
  .courante .num { border-color: var(--accent); background: var(--accent); color: #fff; }
  .texte { padding: 8px 10px 10px 46px; font-size: 15px; }
  .ref { margin-top: 6px; font-size: 12px; color: var(--encre-2); }
  span.ref { margin: 0; }
  .mecanismes { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
  .mecanismes li { display: flex; gap: 8px; align-items: baseline; }

  .pas { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--bord); padding-top: 14px; }
  .pas .bouton { white-space: nowrap; }
  .compte { font-size: 14px; color: var(--encre-2); text-align: center; }
  @media (max-width: 480px) {
    .pas .bouton { padding: 0 12px; }
    .texte { padding-left: 10px; }
  }
</style>
