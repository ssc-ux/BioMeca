<script>
  let { x, y, label = '' } = $props();
  const w = $derived(Math.max(54, label.length * 7 + 18));
</script>

<rect class="forme" x={x - w / 2} y={y - 12} width={w} height="24" rx="12" fill="#e2e8f0" stroke="#64748b" />
<text {x} y={y + 4} text-anchor="middle">{label}</text>
