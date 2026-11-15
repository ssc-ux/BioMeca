<script>
  import { etat, retirer, hash } from '../lib/selection.svelte.js';
  import { moleculeParId } from '../lib/data.js';
  import { couleur } from '../lib/couleurs.js';

  let { lienMecanisme = false } = $props();
  const mols = $derived(etat.ids.map((id) => moleculeParId[id]));

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

{#if mols.length}
  <ul class="puces" aria-label="Molécules sélectionnées">
    {#each mols as m (m.id)}
      <li>
        <button class="puce" style:background={couleur(m.id)} onclick={() => retirer(m.id)} aria-label="Retirer {m.dci}">
          {m.dci} <span aria-hidden="true">×</span>
        </button>
      </li>
    {/each}
    <li class="actions">
      {#if lienMecanisme}<a class="bouton primaire" href={hash('/mecanisme')}>Voir le mécanisme <span aria-hidden="true">→</span></a>{/if}
      <button class="bouton" onclick={copierLien}>{copie ? 'Lien copié' : 'Copier le lien'}</button>
    </li>
  </ul>
{:else if lienMecanisme}
  <p class="aucune">Aucune molécule sélectionnée pour l'instant.</p>
{/if}

<style>
  .puces { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .puce { min-height: 44px; padding: 0 16px; border: 0; border-radius: 22px; color: #fff; font-weight: 600; font-size: 15px; }
  .puce:hover { filter: brightness(0.88); }
  .puce span { margin-left: 6px; font-size: 18px; line-height: 1; }
  .actions { margin-left: auto; display: flex; flex-wrap: wrap; gap: 8px; }
  a.bouton { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
  .aucune { font-size: 14px; color: var(--encre-2); }
</style>
