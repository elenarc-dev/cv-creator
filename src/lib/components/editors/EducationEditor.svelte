<script lang="ts">
  import DateInput from "$lib/components/fields/DateInput.svelte";
  import LocalizedInput from "$lib/components/fields/LocalizedInput.svelte";
  import LocalizedTextarea from "$lib/components/fields/LocalizedTextarea.svelte";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";

  const profile = $derived(workspace.profile);

  function commit() {
    workspace.commit();
  }
</script>

<div class="editor">
  <button type="button" class="add" onclick={() => workspace.addEducation()}>
    + {t("editor.add")}
  </button>

  {#if profile.education.length === 0}
    <p class="empty">{t("editor.empty")}</p>
  {/if}

  {#each profile.education as edu (edu.id)}
    <section class="card">
      <header class="card-head">
        <strong>{edu.institution || "—"}</strong>
        <button type="button" class="danger" onclick={() => workspace.removeEducation(edu.id)}>
          {t("editor.remove")}
        </button>
      </header>

      <LocalizedInput label={t("fields.degree")} value={edu.degree} />

      <div class="grid2">
        <div class="field">
          <span class="lfield-label">{t("fields.institution")}</span>
          <input
            value={edu.institution}
            oninput={(e) => (edu.institution = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.level")}</span>
          <input
            value={edu.level}
            oninput={(e) => (edu.level = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
      </div>

      <div class="grid2">
        <DateInput
          label={t("fields.start")}
          value={edu.start}
          onValue={(value) => (edu.start = value || undefined)}
        />
        <DateInput
          label={t("fields.end")}
          value={edu.end}
          onValue={(value) => (edu.end = value || undefined)}
        />
      </div>

      <LocalizedInput label={t("fields.location")} value={edu.location} />
      <LocalizedTextarea label={t("fields.description")} value={edu.description} />
    </section>
  {/each}
</div>
