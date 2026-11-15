<script>
  import { etat, ajouter } from '../lib/selection.svelte.js';
  import { moleculeParId, voieParId, molecules } from '../lib/data.js';
  import { grouperParVoie } from '../lib/groupes.js';
  import { couleur } from '../lib/couleurs.js';
  import Recherche from '../composants/Recherche.svelte';
  import Puces from '../composants/Puces.svelte';
  import PanneauVoie from '../composants/PanneauVoie.svelte';
  import Comparaison from '../composants/Comparaison.svelte';

  const mols = $derived(etat.ids.map((id) => moleculeParId[id]));
  const groupes = $derived(grouperParVoie(mols));
</script>

<h1 class="sr-only">Mécanisme d'action</h1>

<section class="selection" aria-label="Sélection des molécules">
  <Recherche exclus={etat.ids} onchoisir={ajouter} />
  <Puces />
</section>

{#if mols.length === 0}
  <section class="carte vide">
    <h2>Choisissez une ou plusieurs biothérapies</h2>
    <p>Chaque voie s'affiche dans un schéma pas à pas : voie physiologique détaillée, fixation du médicament, puis conséquences en aval. Les molécules d'une même voie partagent le même schéma, et un tableau les compare.</p>
    <ul class="suggestions">
      {#each molecules as m (m.id)}
        <li><button class="bouton" onclick={() => ajouter(m.id)}><span class="pastille" style:background={couleur(m.id)}></span>{m.dci}</button></li>
      {/each}
    </ul>
  </section>
{:else}
  <div class="disposition">
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
  .vide { padding: 28px; display: flex; flex-direction: column; gap: 12px; }
  .vide h2 { font-size: 20px; }
  .vide p { color: var(--encre-2); max-width: 70ch; }
  .suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .suggestions .bouton { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; }
  .disposition { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
  .panneaux { flex: 1 1 100%; min-width: 0; display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
</style>
