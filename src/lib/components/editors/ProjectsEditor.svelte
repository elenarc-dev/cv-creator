<script lang="ts">
  import DateInput from "$lib/components/fields/DateInput.svelte";
  import IdPicker from "$lib/components/fields/IdPicker.svelte";
  import LocalizedInput from "$lib/components/fields/LocalizedInput.svelte";
  import LocalizedListEditor from "$lib/components/fields/LocalizedListEditor.svelte";
  import LocalizedTextarea from "$lib/components/fields/LocalizedTextarea.svelte";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";

  const profile = $derived(workspace.profile);
  const skillOptions = $derived(
    profile.skills.map((s) => ({ id: s.id, label: s.name })),
  );
  const achievementOptions = $derived(
    profile.achievements.map((a) => ({
      id: a.id,
      label: a.title.es || a.title.en || a.id,
    })),
  );

  function commit() {
    workspace.commit();
  }
</script>

<div class="editor">
  <button type="button" class="add" onclick={() => workspace.addProject()}>
    + {t("editor.add")}
  </button>

  {#if profile.projects.length === 0}
    <p class="empty">{t("editor.empty")}</p>
  {/if}

  {#each profile.projects as project, idx (project.id)}
    <section class="card">
      <header class="card-head">
        <strong>{project.name || "—"}</strong>
        <div>
          {#if idx > 0}
            <button
              class="primary"
              onclick={() => workspace.reorderProject(idx, true)}
            >
              /\
            </button>{/if}

          {#if idx != profile.projects.length}
            <button
              class="primary"
              onclick={() => workspace.reorderProject(idx, false)}
            >
              \/
            </button>{/if}
        </div>
        <button
          type="button"
          class="danger"
          onclick={() => workspace.removeProject(project.id)}
        >
          {t("editor.remove")}
        </button>
      </header>

      <div class="field">
        <span class="lfield-label">{t("fields.name")}</span>
        <input
          value={project.name}
          oninput={(e) => (project.name = e.currentTarget.value)}
          onchange={commit}
        />
      </div>
      <LocalizedInput label={t("fields.role")} value={project.role} />

      <div class="grid2">
        <div class="field">
          <span class="lfield-label">{t("fields.company")}</span>
          <input
            value={project.company ?? ""}
            oninput={(e) =>
              (project.company = e.currentTarget.value || undefined)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.client")}</span>
          <input
            value={project.client ?? ""}
            oninput={(e) =>
              (project.client = e.currentTarget.value || undefined)}
            onchange={commit}
          />
        </div>
      </div>

      <div class="grid2">
        <DateInput
          label={t("fields.start")}
          value={project.start}
          onValue={(value) => (project.start = value || undefined)}
        />
        <DateInput
          label={t("fields.end")}
          value={project.end}
          onValue={(value) => (project.end = value || undefined)}
        />
      </div>

      <div class="grid2">
        <div class="field">
          <span class="lfield-label">{t("fields.url")}</span>
          <input
            value={project.url ?? ""}
            oninput={(e) => (project.url = e.currentTarget.value || undefined)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.repo")}</span>
          <input
            value={project.repo ?? ""}
            oninput={(e) => (project.repo = e.currentTarget.value || undefined)}
            onchange={commit}
          />
        </div>
      </div>

      <LocalizedTextarea
        label={t("fields.description")}
        value={project.description}
      />
      <LocalizedListEditor
        label={t("fields.responsibilities")}
        value={project.responsibilities}
      />

      <IdPicker
        label={t("fields.skills")}
        options={skillOptions}
        selected={project.skillIds}
      />
      <IdPicker
        label={t("fields.achievements")}
        options={achievementOptions}
        selected={project.achievementIds}
      />
    </section>
  {/each}
</div>
