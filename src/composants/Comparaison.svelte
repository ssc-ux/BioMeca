<script>
  import { champs, A_VALIDER } from '../lib/data.js';
  import { comparer } from '../lib/groupes.js';
  import { couleur } from '../lib/couleurs.js';

  let { mols } = $props();
  const comp = $derived(comparer(mols, champs));
  const seule = $derived(mols.length === 1);
</script>

<aside aria-label="Comparaison">
  <section class="carte">
    <h2>{seule ? `Fiche : ${mols[0].dci}` : 'En commun'}</h2>
    {#if comp.commun.length}
      <dl>
        {#each comp.commun as c}
          <dt>{c.libelle}</dt>
          <dd class:a-valider={c.valeur === A_VALIDER}>{c.valeur}</dd>
        {/each}
      </dl>
    {:else}
      <p class="rien">Aucun champ identique.</p>
    {/if}
  </section>

  {#if !seule}
    <section class="carte">
      <h2>Différences</h2>
      {#if comp.differences.length}
        <dl>
          {#each comp.differences as d}
            <dt>{d.libelle}</dt>
            {#each d.valeurs as v}
              <dd class="ligne">
                <span class="pastille" style:background={couleur(v.id)}></span>
                <span><strong style:color={couleur(v.id)}>{v.dci}</strong> : <span class:a-valider={v.valeur === A_VALIDER}>{v.valeur}</span></span>
              </dd>
            {/each}
          {/each}
        </dl>
      {:else}
        <p class="rien">Aucune différence sur les champs renseignés.</p>
      {/if}
    </section>
  {/if}
</aside>

<style>
  aside { flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
  section { padding: 18px; }
  h2 { font-size: 16px; margin-bottom: 10px; }
  dl { margin: 0; font-size: 14px; }
  dt { font-weight: 600; color: var(--encre-2); margin-top: 10px; }
  dt:first-child { margin-top: 0; }
  dd { margin: 2px 0 0; }
  .ligne { display: flex; gap: 8px; align-items: baseline; margin-top: 4px; }
  .ligne .pastille { position: relative; top: 1px; }
  .rien { font-size: 14px; color: var(--encre-2); }
</style>
