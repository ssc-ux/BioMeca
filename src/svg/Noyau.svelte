<script>
  import { taille } from './geometrie.js';
  let { x, y, label = '' } = $props();
  const rx = $derived(taille({ type: 'noyau', label }).hw);
</script>

<ellipse class="forme" cx={x} cy={y} {rx} ry="22" fill="#f0edfb" stroke="#6d5bd0" stroke-width="1.5" />
<text {x} y={y + 4} text-anchor="middle">{label}</text>
