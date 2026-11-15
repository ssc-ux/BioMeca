<script>
  import { parametre, hash, definir } from '../lib/selection.svelte.js';
  import { maladies, maladieParId, voieParId, moleculeParId, cibleParId } from '../lib/data.js';
  import Puces from '../composants/Puces.svelte';
  import MoleculeLigne from '../composants/MoleculeLigne.svelte';

  const maladie = $derived(maladieParId[parametre()]);
  const mols = $derived(maladie ? maladie.moleculeIds.map((id) => moleculeParId[id]) : []);
  const ciblesDe = (voieId) => [...new Set(mols.filter((m) => m.voieId === voieId).map((m) => cibleParId[m.cibleId]))];
</script>

<div class="vue">
  <header>
    <h1>Par maladie</h1>
    <p>Pour chaque maladie : les voies ciblées, puis les biothérapies disponibles sur chacune. La liste se limite aux molécules présentes sur le site.</p>
  </header>

  <Puces lienMecanisme />

  <nav class="choix" aria-label="Maladies">
    <ul>
      {#each maladies as d (d.id)}
        <li><a href={hash('/maladie/' + d.id)} aria-current={d === maladie ? 'page' : undefined}>{d.nom}</a></li>
      {:else}
        <li class="a-valider">Maladies : à valider</li>
      {/each}
    </ul>
  </nav>

  {#if maladie}
    <section class="carte bloc entete">
      <h2>{maladie.nom}</h2>
      <p>{maladie.voieIds.length} voie{maladie.voieIds.length > 1 ? 's' : ''} ciblée{maladie.voieIds.length > 1 ? 's' : ''}, {mols.length} molécule{mols.length > 1 ? 's' : ''}.</p>
      <button class="bouton primaire" onclick={() => { definir(maladie.moleculeIds); location.hash = hash('/mecanisme'); }}>
        Comparer ces {mols.length > 1 ? mols.length + ' molécules' : 'molécule'} dans la vue Mécanisme <span aria-hidden="true">→</span>
      </button>
    </section>

    <div class="voies">
      {#each maladie.voieIds as voieId, k (voieId)}
        <section class="carte bloc">
          <p class="rang">Voie {k + 1}</p>
          <h2>{voieParId[voieId].nom}</h2>
          <p class="cibles">
            Cible{ciblesDe(voieId).length > 1 ? 's' : ''} :
            {#each ciblesDe(voieId) as c, j (c.id)}{j ? ', ' : ''}<a class="lien" href={hash('/cible/' + c.id)}>{c.nom}</a>{/each}
          </p>
          <ul>
            {#each mols.filter((m) => m.voieId === voieId) as m (m.id)}<MoleculeLigne {m} />{/each}
          </ul>
        </section>
      {/each}
    </div>
  {/if}
</div>

<style>
  .entete { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
  .entete h2 { margin: 0; }
  .entete p { color: var(--encre-2); }
  .voies { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
  .voies section { flex: 1 1 380px; min-width: 0; }
  .rang { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); }
  .cibles { font-size: 14px; color: var(--encre-2); margin-bottom: 6px; }
</style>
