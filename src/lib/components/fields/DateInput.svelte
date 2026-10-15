<script lang="ts">
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";

  let {
    value,
    label = "",
    required = false,
    onValue,
  }: {
    value?: string;
    label?: string;
    required?: boolean;
    onValue: (value: string) => void;
  } = $props();

  function update(event: Event) {
    onValue((event.currentTarget as HTMLInputElement).value);
  }

  function commit() {
    workspace.commit();
  }
</script>

<div class="field">
  {#if label}<span class="lfield-label">{label}</span>{/if}
  <input
    type="text"
    inputmode="numeric"
    autocomplete="off"
    maxlength="7"
    pattern="[0-9]{4}(-[0-9]{2})?"
    placeholder={t("fields.dateHint")}
    value={value ?? ""}
    required={required}
    oninput={update}
    onchange={commit}
  />
</div>
