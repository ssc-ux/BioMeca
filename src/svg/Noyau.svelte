<script>
  let { x, y, label = '' } = $props();
  const rx = $derived(Math.max(120, label.length * 3.3 + 16));
</script>

<ellipse class="forme" cx={x} cy={y} {rx} ry="22" fill="#f1f5f9" stroke="#64748b" />
<text {x} y={y + 4} text-anchor="middle">{label}</text>
