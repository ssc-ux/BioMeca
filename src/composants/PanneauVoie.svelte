<script>
  import { cibleParId, afficher } from '../lib/data.js';
  import { placer, bloquesPar } from '../lib/groupes.js';
  import { couleur } from '../lib/couleurs.js';
  import Scene from '../svg/Scene.svelte';

  let { voie, mols } = $props();

  let blocage = $state(false);
  let surligne = $state(null);
  const placements = $derived(placer(mols, cibleParId));
  const cibles = $derived([...new Set(mols.map((m) => cibleParId[m.cibleId]))]);
  const bloques = $derived(blocage ? bloquesPar(cibles, voie.scene.liens) : new Set());
</script>

<section class="carte panneau" aria-labelledby="titre-{voie.id}">
  <header>
    <h2 id="titre-{voie.id}">{voie.nom}</h2>
    <p class="aide">Survolez ou touchez un élément pour afficher son rôle.</p>
  </header>

  <div class="corps">
    <div class="schema">
      <Scene {voie} {placements} {bloques} {surligne} />
      <ul class="legende" aria-label="Légende du schéma">
        <li><span class="ic rond"></span>Cytokine</li>
        <li><span class="ic recepteur"></span>Récepteur</li>
        <li><span class="ic pilule"></span>Protéine de signalisation</li>
        <li><span class="ic effet"></span>Effet biologique</li>
        <li><span class="ic fleche"></span>Active</li>
        <li><span class="ic frein"></span>Inhibe</li>
      </ul>
    </div>

    <div class="cote">
      <h3>Médicaments sur cette voie</h3>
      <ul class="mols">
        {#each mols as m (m.id)}
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <li onmouseenter={() => (surligne = m.id)} onmouseleave={() => (surligne = null)}>
            <span class="pastille" style:background={couleur(m.id)}></span>
            <span>
              <strong style:color={couleur(m.id)}>{m.dci}</strong>
              <span class="cible">sur {cibleParId[m.cibleId].nom}</span>
              <span class="meca" class:a-valider={!m.mecanisme}>{afficher(m.mecanisme)}</span>
            </span>
          </li>
        {/each}
      </ul>

      <button class="bouton" class:primaire={blocage} aria-pressed={blocage} onclick={() => (blocage = !blocage)}>
        {blocage ? 'Masquer les conséquences du blocage' : 'Montrer les conséquences du blocage'}
      </button>
      {#if blocage}
        <p class="blocage" aria-live="polite">{voie.blocage}</p>
      {/if}
    </div>
  </div>
</section>

<style>
  .panneau { flex: 1 1 520px; min-width: 0; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px; }
  h2 { font-size: 18px; }
  .aide { font-size: 13px; color: var(--encre-2); }

  .corps { display: flex; flex-wrap: wrap; gap: 20px 28px; align-items: flex-start; }
  .schema { flex: 3 1 440px; min-width: 0; max-width: 860px; overflow-x: auto; }
  .schema :global(.cadre) { min-width: 520px; }
  .cote { flex: 1 1 280px; min-width: 0; display: flex; flex-direction: column; gap: 12px; }

  .legende { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font-size: 12.5px; color: var(--encre-2); }
  .legende li { display: flex; align-items: center; gap: 6px; }
  .ic { display: inline-block; flex: none; }
  .rond { width: 13px; height: 13px; border-radius: 50%; background: #0b5c6b; }
  .recepteur { width: 7px; height: 16px; border-radius: 3px; background: #0e7490; }
  .pilule { width: 22px; height: 11px; border-radius: 6px; background: #eef2f7; border: 1.2px solid #64748b; }
  .effet { width: 18px; height: 12px; border-radius: 3px; background: #e3f1f3; border: 1.2px solid #0b5c6b; }
  .fleche { width: 20px; height: 0; border-top: 2px solid #64748b; position: relative; }
  .fleche::after { content: ''; position: absolute; right: -2px; top: -5px; border: 4px solid transparent; border-left: 7px solid #64748b; }
  .frein { width: 18px; height: 0; border-top: 2px dashed #be123c; position: relative; }
  .frein::after { content: ''; position: absolute; right: 0; top: -6px; height: 10px; border-right: 3px solid #be123c; }

  h3 { font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--encre-2); }
  .mols { display: flex; flex-direction: column; gap: 4px; }
  .mols li { display: flex; gap: 8px; align-items: baseline; padding: 8px 10px; border-radius: 8px; font-size: 14px; }
  .mols li:hover { background: var(--fond); }
  .cible { color: var(--encre-2); font-size: 13px; }
  .meca { display: block; margin-top: 2px; }
  .cote .bouton { align-self: flex-start; font-size: 14px; }
  .blocage { padding: 12px 14px; border-radius: 8px; background: var(--accent-clair); font-size: 14px; }
</style>
