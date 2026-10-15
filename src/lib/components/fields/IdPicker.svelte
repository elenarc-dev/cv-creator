<script lang="ts">
  import { workspace } from "$lib/state/workspace.svelte";

  let {
    options,
    selected,
    label = "",
  }: {
    options: { id: string; label: string }[];
    selected: string[];
    label?: string;
  } = $props();

  function toggle(id: string) {
    const i = selected.indexOf(id);
    if (i >= 0) selected.splice(i, 1);
    else selected.push(id);
    workspace.commit();
  }
</script>

<div class="picker">
  {#if label}<span class="lfield-label">{label}</span>{/if}
  <div class="picker-options">
    {#each options as o (o.id)}
      <label class="picker-option" class:on={selected.includes(o.id)}>
        <input
          type="checkbox"
          checked={selected.includes(o.id)}
          onchange={() => toggle(o.id)}
        />
        <span>{o.label}</span>
      </label>
    {/each}
  </div>
</div>
