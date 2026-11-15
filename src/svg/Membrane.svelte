<script>
  let { y, label = '', dessus = '', dessous = '', largeur = 640 } = $props();
</script>

<rect class="forme" x="0" y={y - 9} width={largeur} height="18" fill="#cbd5e1" />
<g class="zone">
  <text x="8" y="18">{dessus}</text>
  <text x="8" y={y + 4} fill="#1e293b">{label}</text>
  <text x="8" y={y + 30}>{dessous}</text>
</g>

<style>
  .zone { fill: #475569; font-size: 11px; }
</style>
