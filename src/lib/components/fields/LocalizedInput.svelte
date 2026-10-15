<script lang="ts">
  import { workspace } from "$lib/state/workspace.svelte";

  let { value, label = "" }: { value: Record<string, string>; label?: string } = $props();

  function onInput(lang: string, event: Event) {
    value[lang] = (event.currentTarget as HTMLInputElement).value;
  }
  function commit() {
    workspace.commit();
  }
</script>

<div class="lfield">
  {#if label}<span class="lfield-label">{label}</span>{/if}
  <div class="lfield-row">
    {#each ["es", "en"] as lang (lang)}
      <input
        class="lfield-input"
        placeholder={lang}
        value={value[lang] ?? ""}
        oninput={(e) => onInput(lang, e)}
        onchange={commit}
      />
    {/each}
  </div>
</div>
