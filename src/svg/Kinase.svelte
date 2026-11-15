<script>
  import { taille } from './geometrie.js';
  let { x, y, label = '' } = $props();
  const w = $derived(taille({ type: 'kinase', label }).hw * 2);
</script>

<rect class="forme" x={x - w / 2} y={y - 12} width={w} height="24" rx="12" fill="#eef2f7" stroke="#64748b" stroke-width="1.2" />
<text {x} y={y + 4} text-anchor="middle">{label}</text>
