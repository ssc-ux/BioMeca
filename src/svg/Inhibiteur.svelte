<script>
  // Petite molécule : losange relié à sa cible.
  let { x, y, angle = 0, couleur } = $props();
</script>

<g transform="translate({x},{y}) rotate({angle})" stroke={couleur} stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M0-3v-19" fill="none" />
  <path d="M0-22l10-10l-10-10l-10 10z" fill={couleur} />
</g>
