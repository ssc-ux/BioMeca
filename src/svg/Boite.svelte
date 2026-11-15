<script>
  // Boîte de texte multi-ligne : cellule productrice (source), famille de cytokines, effet biologique.
  import { taille } from './geometrie.js';
  let { x, y, label = '', variante = 'effet' } = $props();
  const lignes = $derived(label.split('\n'));
  const t = $derived(taille({ type: 'boite', label }));
</script>

<g class={variante}>
  <rect class="forme" x={x - t.hw} y={y - t.hh} width={t.hw * 2} height={t.hh * 2} rx="7" />
  <text {x} y={y - t.hh + 6} text-anchor="middle">
    {#each lignes as l}<tspan {x} dy="15">{l}</tspan>{/each}
  </text>
</g>

<style>
  text { font-size: 12px; }
  .source rect { fill: #fff; stroke: #64748b; stroke-width: 1.2; stroke-dasharray: 5 3; }
  .famille rect { fill: #0b5c6b; stroke: #fff; stroke-width: 1.5; }
  .famille text { fill: #fff; font-weight: 600; }
  .effet rect { fill: #e3f1f3; stroke: #0b5c6b; stroke-width: 1.2; }
</style>
