<script lang="ts">
  import DateInput from "$lib/components/fields/DateInput.svelte";
  import IdPicker from "$lib/components/fields/IdPicker.svelte";
  import LocalizedInput from "$lib/components/fields/LocalizedInput.svelte";
  import LocalizedListEditor from "$lib/components/fields/LocalizedListEditor.svelte";
  import LocalizedTextarea from "$lib/components/fields/LocalizedTextarea.svelte";
  import type { WorkMode } from "$lib/domain/schema";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";

  const profile = $derived(workspace.profile);
  const skillOptions = $derived(profile.skills.map((s) => ({ id: s.id, label: s.name })));
  const projectOptions = $derived(profile.projects.map((p) => ({ id: p.id, label: p.name })));
  const achievementOptions = $derived(
    profile.achievements.map((a) => ({ id: a.id, label: a.title.es || a.title.en || a.id })),
  );
  const modes: WorkMode[] = ["remote", "hybrid", "onsite"];

  function commit() {
    workspace.commit();
  }
</script>

<div class="editor">
  <button type="button" class="add" onclick={() => workspace.addExperience()}>
    + {t("editor.add")}
  </button>

  {#if profile.experiences.length === 0}
    <p class="empty">{t("editor.empty")}</p>
  {/if}

  {#each profile.experiences as exp (exp.id)}
    <section class="card">
      <header class="card-head">
        <strong>{exp.company || "—"}</strong>
        <button type="button" class="danger" onclick={() => workspace.removeExperience(exp.id)}>
          {t("editor.remove")}
        </button>
      </header>

      <div class="field">
        <span class="lfield-label">{t("fields.company")}</span>
        <input
          value={exp.company}
          oninput={(e) => (exp.company = e.currentTarget.value)}
          onchange={commit}
        />
      </div>
      <LocalizedInput label={t("fields.role")} value={exp.role} />

      <div class="grid3">
        <DateInput
          label={t("fields.start")}
          value={exp.start}
          required
          onValue={(value) => (exp.start = value)}
        />
        <DateInput
          label={t("fields.end")}
          value={exp.end}
          onValue={(value) => (exp.end = value || undefined)}
        />
        <div class="field">
          <span class="lfield-label">{t("fields.mode")}</span>
          <select
            value={exp.mode}
            onchange={(e) => {
              exp.mode = (e.currentTarget as HTMLSelectElement).value as WorkMode;
              commit();
            }}
          >
            {#each modes as m (m)}
              <option value={m}>{t(`mode.${m}`)}</option>
            {/each}
          </select>
        </div>
      </div>

      <LocalizedInput label={t("fields.location")} value={exp.location} />
      <LocalizedTextarea label={t("fields.summary")} value={exp.summary} />
      <LocalizedTextarea label={t("fields.description")} value={exp.description} />
      <LocalizedListEditor label={t("fields.responsibilities")} value={exp.responsibilities} />

      <IdPicker label={t("fields.skills")} options={skillOptions} selected={exp.skillIds} />
      <IdPicker label={t("fields.projects")} options={projectOptions} selected={exp.projectIds} />
      <IdPicker
        label={t("fields.achievements")}
        options={achievementOptions}
        selected={exp.achievementIds}
      />
    </section>
  {/each}
</div>
