<script>
  import { champs, A_VALIDER } from '../lib/data.js';
  import { comparer } from '../lib/groupes.js';
  import { couleur } from '../lib/couleurs.js';

  let { mols } = $props();
  const comp = $derived(comparer(mols, champs));
  const seule = $derived(mols.length === 1);
  const items = (v) => v.split(' ; ');
</script>

{#snippet valeur(v)}
  {#if v === A_VALIDER}
    <span class="a-valider">{v}</span>
  {:else if items(v).length > 1}
    <ul>{#each items(v) as x}<li>{x}</li>{/each}</ul>
  {:else}
    {v}
  {/if}
{/snippet}

<section class="carte" aria-labelledby="titre-comparaison">
  <h2 id="titre-comparaison">{seule ? `Fiche : ${mols[0].dci}` : 'Comparaison des molécules'}</h2>
  {#if !seule}
    <p class="aide">Une ligne par caractéristique. Les points communs sont regroupés en haut, les différences sont détaillées molécule par molécule.</p>
  {/if}

  <div class="defilement">
    <table>
      <thead>
        <tr>
          <th scope="col"><span class="sr-only">Caractéristique</span></th>
          {#each mols as m (m.id)}
            <th scope="col" style:border-top-color={couleur(m.id)} style:color={couleur(m.id)}>{m.dci}</th>
          {/each}
        </tr>
      </thead>

      {#if comp.commun.length}
        <tbody>
          {#if !seule}
            <tr class="section"><th colspan={mols.length + 1} scope="rowgroup">Points communs</th></tr>
          {/if}
          {#each comp.commun as c}
            <tr>
              <th scope="row">{c.libelle}</th>
              <td colspan={mols.length} class:commun={!seule}>{@render valeur(c.valeur)}</td>
            </tr>
          {/each}
        </tbody>
      {/if}

      {#if comp.differences.length}
        <tbody>
          <tr class="section"><th colspan={mols.length + 1} scope="rowgroup">Différences</th></tr>
          {#each comp.differences as d}
            <tr>
              <th scope="row">{d.libelle}</th>
              {#each d.valeurs as v (v.id)}
                <td>{@render valeur(v.valeur)}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      {/if}

    </table>
  </div>
</section>

<style>
  section { flex: 1 1 100%; min-width: 0; padding: 20px; }
  h2 { font-size: 18px; }
  .aide { margin-top: 4px; font-size: 14px; color: var(--encre-2); }
  .defilement { margin-top: 14px; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead th {
    padding: 10px 12px; text-align: left; font-size: 15px;
    border-top: 4px solid transparent; background: var(--fond); min-width: 170px;
  }
  thead th:first-child { min-width: 130px; background: none; }
  tbody th[scope='row'] { width: 130px; padding: 10px 12px 10px 0; text-align: left; vertical-align: top; font-weight: 600; color: var(--encre-2); }
  td { padding: 10px 12px; vertical-align: top; border-left: 1px solid var(--bord); }
  tbody tr { border-top: 1px solid var(--bord); }
  .section th {
    padding: 14px 0 6px; text-align: left; font-size: 12px; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--accent);
  }
  tr.section { border-top: 0; }
  td.commun { background: var(--accent-clair); text-align: center; font-weight: 500; }
  td.commun ul { display: inline-block; text-align: left; }
  td ul { display: flex; flex-direction: column; gap: 3px; padding-left: 16px; list-style: disc; }
</style>
