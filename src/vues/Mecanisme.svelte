<script>
  import { etat, ajouter, retirer } from '../lib/selection.svelte.js';
  import { moleculeParId, voieParId, molecules } from '../lib/data.js';
  import { grouperParVoie } from '../lib/groupes.js';
  import { couleur } from '../lib/couleurs.js';
  import Recherche from '../composants/Recherche.svelte';
  import PanneauVoie from '../composants/PanneauVoie.svelte';
  import Comparaison from '../composants/Comparaison.svelte';

  const mols = $derived(etat.ids.map((id) => moleculeParId[id]));
  const groupes = $derived(grouperParVoie(mols));

  let copie = $state(false);
  async function copierLien() {
    try {
      await navigator.clipboard.writeText(location.href);
      copie = true;
      setTimeout(() => (copie = false), 2500);
    } catch {
      prompt('Copiez ce lien :', location.href);
    }
  }
</script>

<h1 class="sr-only">Mécanisme d'action</h1>

<section class="selection" aria-label="Sélection des molécules">
  <Recherche exclus={etat.ids} onchoisir={ajouter} />
  {#if mols.length}
    <ul class="puces" aria-label="Molécules sélectionnées">
      {#each mols as m (m.id)}
        <li>
          <button class="puce" style:background={couleur(m.id)} onclick={() => retirer(m.id)} aria-label="Retirer {m.dci}">
            {m.dci} <span aria-hidden="true">×</span>
          </button>
        </li>
      {/each}
      <li class="partage">
        <button class="bouton" onclick={copierLien}>{copie ? 'Lien copié' : 'Copier le lien'}</button>
      </li>
    </ul>
  {/if}
</section>

{#if mols.length === 0}
  <section class="carte vide">
    <h2>Choisissez une ou plusieurs biothérapies</h2>
    <p>Chaque voie s'affiche dans un schéma pas à pas : voie physiologique, fixation du médicament, puis conséquences en aval. Les molécules d'une même voie partagent le même schéma.</p>
    <ul class="suggestions">
      {#each molecules as m (m.id)}
        <li><button class="bouton" onclick={() => ajouter(m.id)}><span class="pastille" style:background={couleur(m.id)}></span>{m.dci}</button></li>
      {/each}
    </ul>
  </section>
{:else}
  <div class="disposition" class:multi={groupes.length > 1}>
    <div class="panneaux">
      {#each groupes as g (g.voieId)}
        <PanneauVoie voie={voieParId[g.voieId]} mols={g.molecules} />
      {/each}
    </div>
    <Comparaison {mols} />
  </div>
{/if}

<style>
  .selection { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .puces { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .puce {
    min-height: 44px; padding: 0 16px; border: 0; border-radius: 22px;
    color: #fff; font-weight: 600; font-size: 15px;
  }
  .puce:hover { filter: brightness(0.88); }
  .puce span { margin-left: 6px; font-size: 18px; line-height: 1; }
  .partage { margin-left: auto; }
  .vide { padding: 28px; display: flex; flex-direction: column; gap: 12px; }
  .vide h2 { font-size: 20px; }
  .vide p { color: var(--encre-2); max-width: 70ch; }
  .suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .suggestions .bouton { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; }
  .disposition { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
  .multi :global(aside) { flex-basis: 100%; flex-direction: row; flex-wrap: wrap; }
  .multi :global(aside > section) { flex: 1 1 320px; min-width: 0; }
  .panneaux { flex: 999 1 560px; min-width: 0; display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
</style>
