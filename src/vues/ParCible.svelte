<script>
  import { parametre, hash } from '../lib/selection.svelte.js';
  import { cibles, cibleParId, voies, voieParId, molecules } from '../lib/data.js';
  import Puces from '../composants/Puces.svelte';
  import MoleculeLigne from '../composants/MoleculeLigne.svelte';
  import PanneauVoie from '../composants/PanneauVoie.svelte';
  import Comparaison from '../composants/Comparaison.svelte';

  const cible = $derived(cibleParId[parametre()]);
  const mols = $derived(cible ? molecules.filter((m) => m.cibleId === cible.id) : []);
</script>

<div class="vue">
  <header>
    <h1>Par cible</h1>
    <p>Choisissez une cible pour voir toutes les molécules qui agissent dessus, replacées dans leur voie.</p>
  </header>

  <Puces lienMecanisme />

  <nav class="choix" aria-label="Cibles">
    {#each voies as v (v.id)}
      <div>
        <h2>{v.nom}</h2>
        <ul>
          {#each cibles.filter((c) => c.voieId === v.id) as c (c.id)}
            <li><a href={hash('/cible/' + c.id)} aria-current={c === cible ? 'page' : undefined}>{c.nom}</a></li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>

  {#if cible}
    <section class="carte bloc">
      <h2>{cible.nom} : {mols.length} molécule{mols.length > 1 ? 's' : ''}</h2>
      <ul>
        {#each mols as m (m.id)}<MoleculeLigne {m} />{/each}
      </ul>
    </section>

    {#key cible.id}
      <PanneauVoie voie={voieParId[cible.voieId]} {mols} />
    {/key}

    <Comparaison {mols} />
  {/if}
</div>
