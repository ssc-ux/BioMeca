<script>
  let { x, y, label = '' } = $props();
  const r = $derived(Math.max(18, label.length * 3.3 + 5));
</script>

<circle class="forme" cx={x} cy={y} {r} fill="#0b5c6b" />
<text {x} y={y + 4} text-anchor="middle" fill="#fff">{label}</text>
