<script>
  import { taille } from './geometrie.js';
  let { x, y, label = '' } = $props();
  const r = $derived(taille({ type: 'cytokine', label }).hw);
</script>

<circle class="forme" cx={x} cy={y} {r} fill="#0b5c6b" stroke="#fff" stroke-width="1.5" />
<text {x} y={y + 4} text-anchor="middle" fill="#fff" font-weight="600">{label}</text>
