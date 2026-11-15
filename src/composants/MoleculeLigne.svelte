<script>
  import { etat, basculer } from '../lib/selection.svelte.js';
  import { afficher } from '../lib/data.js';
  import { couleur } from '../lib/couleurs.js';

  let { m } = $props();
  const choisie = $derived(etat.ids.includes(m.id));
</script>

<li>
  <span class="pastille" style:background={couleur(m.id)}></span>
  <span class="texte">
    <span><strong style:color={couleur(m.id)}>{m.dci}</strong>{#if m.abreviation}&nbsp;({m.abreviation}){/if}</span>
    <span class="detail" class:a-valider={!m.classe}>{afficher(m.classe)} · <span class:a-valider={!m.administration}>{afficher(m.administration)}</span></span>
  </span>
  <button class="bouton" class:primaire={!choisie} aria-pressed={choisie} onclick={() => basculer(m.id)}>
    {choisie ? 'Retirer' : 'Sélectionner'}
  </button>
</li>

<style>
  li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--bord); }
  li:first-child { border-top: 0; }
  .texte { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .detail { font-size: 13px; color: var(--encre-2); }
  .bouton { flex: none; min-width: 116px; }
</style>
