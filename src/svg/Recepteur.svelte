<script>
  let { x, y, label = '' } = $props();
</script>

<rect class="forme" x={x - 11} y={y - 33} width="22" height="66" rx="6" fill="#0e7490" />
<text x={x + 17} y={y + 34}>{label}</text>
