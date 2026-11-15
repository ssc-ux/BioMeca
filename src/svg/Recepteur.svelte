<script>
  let { x, y, label = '' } = $props();
</script>

<rect class="forme" x={x - 11} y={y - 33} width="22" height="66" rx="7" fill="#0e7490" stroke="#fff" stroke-width="1.5" />
<rect x={x - 11} y={y - 9} width="22" height="18" fill="#155e75" opacity="0.55" />
{#if label}<text x={x + 17} y={y + 34}>{label}</text>{/if}
