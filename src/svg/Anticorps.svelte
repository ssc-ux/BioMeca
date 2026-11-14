<script>
  // Y dont les deux bras (Fab) touchent la cible ; variante « fusion » : récepteur soluble couplé à un Fc.
  let { x, y, angle = 0, couleur, fusion = false } = $props();
</script>

<g transform="translate({x},{y}) rotate({angle})" stroke={couleur} stroke-width="5" stroke-linecap="round" fill="none">
  <path d="M0-46v22M0-24l-8 19M0-24l8 19" />
  {#if fusion}
    <circle cx="-8" cy="-5" r="4" fill={couleur} stroke="none" />
    <circle cx="8" cy="-5" r="4" fill={couleur} stroke="none" />
  {/if}
</g>
