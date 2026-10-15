<script lang="ts">
  import { workspace } from "$lib/state/workspace.svelte";

  let { value, label = "" }: { value: Record<string, string[]>; label?: string } = $props();

  function getText(lang: string): string {
    return (value[lang] ?? []).join("\n");
  }
  function onInput(lang: string, event: Event) {
    const text = (event.currentTarget as HTMLTextAreaElement).value;
    value[lang] = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  function commit() {
    workspace.commit();
  }
</script>

<div class="lfield">
  {#if label}<span class="lfield-label">{label}</span>{/if}
  <div class="lfield-row">
    {#each ["es", "en"] as lang (lang)}
      <textarea
        class="lfield-input"
        rows={4}
        placeholder={`${lang} — un elemento por línea`}
        value={getText(lang)}
        oninput={(e) => onInput(lang, e)}
        onchange={commit}
      ></textarea>
    {/each}
  </div>
</div>
