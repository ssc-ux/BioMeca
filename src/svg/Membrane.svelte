<script>
  let { y, label = '', dessus = '', dessous = '', largeur = 640, hauteur = 480 } = $props();
</script>

<rect x="0" y="0" width={largeur} height={y - 9} fill="#f3f8fb" />
<rect x="0" y={y + 9} width={largeur} height={hauteur - y - 9} fill="#fffdf8" />
<rect x="0" y={y - 9} width={largeur} height="18" fill="#d5dee8" />
<path d="M0 {y - 9}H{largeur}M0 {y + 9}H{largeur}" stroke="#8fa0b3" stroke-width="1.5" />
<g class="zone">
  <text x="10" y="20">{dessus}</text>
  <text x="10" y={y + 4} fill="#1e293b">{label}</text>
  <text x="10" y={y + 30}>{dessous}</text>
</g>

<style>
  .zone { fill: #475569; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
</style>
