<script>
  import { molecules, cibleParId, voieParId } from '../lib/data.js';
  import { couleur } from '../lib/couleurs.js';

  let { exclus = [], onchoisir } = $props();
  let q = $state('');
  let ouvert = $state(false);
  let actif = $state(0);

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const cle = (m) => norm([m.dci, m.abreviation, m.classe, cibleParId[m.cibleId]?.nom, voieParId[m.voieId]?.nom].join(' '));
  const resultats = $derived(molecules.filter((m) => !exclus.includes(m.id) && cle(m).includes(norm(q.trim()))));

  function choisir(m) {
    if (!m) return;
    onchoisir(m.id);
    q = '';
    actif = 0;
  }

  function touche(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      ouvert = true;
      actif = Math.min(actif + 1, resultats.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      actif = Math.max(actif - 1, 0);
    } else if (e.key === 'Enter') {
      if (ouvert) choisir(resultats[actif]);
    } else if (e.key === 'Escape') {
      ouvert = false;
    }
  }
</script>

<div class="recherche">
  <label for="recherche">Rechercher une biothérapie</label>
  <input
    id="recherche"
    type="text"
    autocomplete="off"
    placeholder="DCI, abréviation, cible, voie…"
    role="combobox"
    aria-expanded={ouvert}
    aria-controls="recherche-liste"
    aria-autocomplete="list"
    aria-activedescendant={ouvert && resultats[actif] ? 'opt-' + resultats[actif].id : undefined}
    bind:value={q}
    oninput={() => { ouvert = true; actif = 0; }}
    onfocus={() => (ouvert = true)}
    onblur={() => (ouvert = false)}
    onkeydown={touche}
  />
  {#if ouvert}
    <ul id="recherche-liste" role="listbox" aria-label="Biothérapies">
      {#each resultats as m, i (m.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          id="opt-{m.id}"
          role="option"
          aria-selected={i === actif}
          class:actif={i === actif}
          onmousedown={(e) => e.preventDefault()}
          onclick={() => choisir(m)}
          onmouseenter={() => (actif = i)}
        >
          <span class="pastille" style:background={couleur(m.id)}></span>
          <span class="dci">{m.dci}{#if m.abreviation}&nbsp;<span class="abr">({m.abreviation})</span>{/if}</span>
          <span class="info">{voieParId[m.voieId].nom} · {cibleParId[m.cibleId].nom}</span>
        </li>
      {:else}
        <li class="rien" role="option" aria-selected="false" aria-disabled="true">
          {q.trim() ? 'Aucune biothérapie ne correspond.' : 'Toutes les biothérapies sont déjà sélectionnées.'}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .recherche { position: relative; display: flex; flex-direction: column; gap: 6px; }
  label { font-size: 14px; font-weight: 600; color: var(--encre-2); }
  input {
    height: 48px; padding: 0 14px; font-size: 16px;
    border: 1px solid var(--bord-fort); border-radius: 8px; background: var(--surface);
  }
  ul {
    position: absolute; top: 100%; left: 0; right: 0; z-index: 10; margin-top: 4px;
    max-height: 340px; overflow-y: auto;
    background: var(--surface); border: 1px solid var(--bord-fort); border-radius: 8px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
  }
  li {
    display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px;
    min-height: 44px; padding: 8px 14px; cursor: pointer;
  }
  li.actif { background: var(--accent-clair); }
  .dci { font-weight: 600; }
  .abr { font-weight: 400; color: var(--encre-2); }
  .info { margin-left: auto; font-size: 13px; color: var(--encre-2); }
  .rien { cursor: default; color: var(--encre-2); }
</style>
