<script>
  // Cadre regroupant plusieurs éléments (ex. les paires de JAK).
  let { x, y, w, h, label = '' } = $props();
</script>

<rect class="forme" x={x - w / 2} y={y - h / 2} width={w} height={h} rx="10" fill="#f8fafc" stroke="#64748b" stroke-dasharray="6 4" />
<text x={x - w / 2 + 4} y={y + h / 2 + 15} font-size="11" fill="#475569">{label}</text>
