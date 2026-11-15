<script>
  // Boîte de texte multi-ligne : cellule productrice (source), famille de cytokines, effet biologique.
  let { x, y, label = '', variante = 'effet' } = $props();
  const lignes = $derived(label.split('\n'));
  const w = $derived(Math.max(60, Math.max(...lignes.map((l) => l.length)) * 6.6 + 18));
  const h = $derived(lignes.length * 15 + 12);
</script>

<g class={variante}>
  <rect class="forme" x={x - w / 2} y={y - h / 2} width={w} height={h} rx="6" />
  <text {x} y={y - h / 2 + 6} text-anchor="middle">
    {#each lignes as l}<tspan {x} dy="15">{l}</tspan>{/each}
  </text>
</g>

<style>
  text { font-size: 12px; }
  .source rect { fill: #fff; stroke: #64748b; stroke-dasharray: 5 3; }
  .famille rect { fill: #0b5c6b; }
  .famille text { fill: #fff; }
  .effet rect { fill: #e3f1f3; stroke: #0b5c6b; }
</style>
