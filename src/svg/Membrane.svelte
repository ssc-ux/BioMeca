<script>
  let { y, label = '', dessus = '', dessous = '', largeur = 520 } = $props();
</script>

<rect class="forme" x="0" y={y - 8} width={largeur} height="16" fill="#cbd5e1" />
<g class="zone">
  <text x="8" y="18">{dessus}</text>
  <text x="8" y={y + 30}>{dessous}</text>
  <text x={largeur - 8} y={y + 22} text-anchor="end">{label}</text>
</g>

<style>
  .zone { fill: #475569; font-size: 11px; }
</style>
