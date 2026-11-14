<script>
  import { etat, hash } from './lib/selection.svelte.js';
  import Mecanisme from './vues/Mecanisme.svelte';

  const vues = [
    { chemin: '/mecanisme', nom: 'Mécanisme' },
    { chemin: '/carte', nom: 'Carte des voies' },
    { chemin: '/cible', nom: 'Par cible' },
    { chemin: '/maladie', nom: 'Par maladie' }
  ];
  const active = $derived(vues.find((v) => etat.chemin.startsWith(v.chemin)) ?? vues[0]);
</script>

<header>
  <div class="barre">
    <a class="logo" href={hash('/mecanisme')}>BioMéca</a>
    <nav aria-label="Vues">
      {#each vues as v}
        <a href={hash(v.chemin)} aria-current={v === active ? 'page' : undefined}>{v.nom}</a>
      {/each}
    </nav>
  </div>
</header>

<main>
  {#if active.chemin === '/mecanisme'}
    <Mecanisme />
  {:else}
    <div class="carte avenir">
      <h1>{active.nom}</h1>
      <p>Cette vue arrive à l'étape suivante. Votre sélection est conservée.</p>
    </div>
  {/if}
</main>

<footer>
  Outil pédagogique destiné aux internes. Contenu en cours de relecture : il ne remplace ni le RCP ni les recommandations en vigueur.
</footer>

<style>
  header { background: var(--surface); border-bottom: 1px solid var(--bord); }
  .barre {
    max-width: 1280px; margin: 0 auto; padding: 0 24px;
    display: flex; flex-wrap: wrap; align-items: center; column-gap: 32px;
  }
  .logo { font-weight: 700; font-size: 20px; color: var(--accent); text-decoration: none; padding: 14px 0; }
  nav { display: flex; flex-wrap: wrap; }
  nav a {
    padding: 18px 14px 15px; border-bottom: 3px solid transparent;
    color: var(--encre-2); text-decoration: none; font-size: 15px; font-weight: 500;
  }
  nav a:hover { color: var(--encre); }
  nav a[aria-current='page'] { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
  main { max-width: 1280px; margin: 0 auto; padding: 24px; }
  .avenir { padding: 32px; }
  .avenir h1 { font-size: 22px; margin-bottom: 8px; }
  footer { max-width: 1280px; margin: 0 auto; padding: 8px 24px 32px; font-size: 13px; color: var(--encre-2); }
  @media (max-width: 600px) {
    .barre, main, footer { padding-left: 16px; padding-right: 16px; }
    nav { flex-wrap: nowrap; overflow-x: auto; max-width: 100%; }
    nav a { padding: 12px 10px 9px; white-space: nowrap; font-size: 14px; }
    .logo { padding: 10px 0 0; flex-basis: 100%; }
  }
</style>
