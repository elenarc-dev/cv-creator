<script lang="ts">
  import LocalizedTextarea from "$lib/components/fields/LocalizedTextarea.svelte";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";

  const profile = $derived(workspace.profile);

  function commit() {
    workspace.commit();
  }
</script>

<div class="editor">
  <button type="button" class="add" onclick={() => workspace.addLanguage()}>
    + {t("editor.add")}
  </button>

  {#if profile.languages.length === 0}
    <p class="empty">{t("editor.empty")}</p>
  {/if}

  {#each profile.languages as lang (lang.id)}
    <section class="card">
      <header class="card-head">
        <strong>{lang.name || "—"}</strong>
        <button type="button" class="danger" onclick={() => workspace.removeLanguage(lang.id)}>
          {t("editor.remove")}
        </button>
      </header>

      <div class="grid2">
        <div class="field">
          <span class="lfield-label">{t("fields.language")}</span>
          <input
            value={lang.name}
            oninput={(e) => (lang.name = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.level")}</span>
          <input
            value={lang.level}
            oninput={(e) => (lang.level = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
      </div>

      <div class="field">
        <span class="lfield-label">{t("fields.certification")}</span>
        <input
          value={lang.certification ?? ""}
          oninput={(e) => (lang.certification = e.currentTarget.value || undefined)}
          onchange={commit}
        />
      </div>

      <LocalizedTextarea label={t("fields.description")} value={lang.description} />
    </section>
  {/each}
</div>
