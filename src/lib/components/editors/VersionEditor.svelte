<script lang="ts">
  import IdPicker from "$lib/components/fields/IdPicker.svelte";
  import LocalizedInput from "$lib/components/fields/LocalizedInput.svelte";
  import type { SectionConfig } from "$lib/domain/schema";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";
  import { listTemplates } from "$lib/templates/registry";

  const profile = $derived(workspace.profile);
  const version = $derived(workspace.activeVersion());
  const templates = listTemplates();

  const orderedSections = $derived(
    version ? [...version.sections].sort((a, b) => a.order - b.order) : [],
  );

  const experienceOptions = $derived(
    profile.experiences.map((e) => ({ id: e.id, label: e.company || e.role.es || e.id })),
  );
  const projectOptions = $derived(profile.projects.map((p) => ({ id: p.id, label: p.name || p.id })));
  const educationOptions = $derived(
    profile.education.map((e) => ({ id: e.id, label: e.degree.es || e.institution || e.id })),
  );
  const languageOptions = $derived(profile.languages.map((l) => ({ id: l.id, label: l.name || l.id })));
  const certificationOptions = $derived(
    profile.certifications.map((c) => ({ id: c.id, label: c.name || c.id })),
  );
  const achievementOptions = $derived(
    profile.achievements.map((a) => ({ id: a.id, label: a.title.es || a.title.en || a.id })),
  );

  function sectionLabel(section: SectionConfig): string {
    return section.title.es || section.title.en || section.id;
  }

  function toggleSection(section: SectionConfig) {
    section.visible = !section.visible;
    workspace.commit();
  }

  function moveSection(id: string, dir: -1 | 1) {
    if (!version) return;
    const sorted = [...version.sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    const tmp = a.order;
    a.order = b.order;
    b.order = tmp;
    workspace.commit();
  }

  function commit() {
    workspace.commit();
  }
</script>

<div class="editor">
  {#if version}
    <div class="field">
      <span class="lfield-label">{t("editor.tabs.version")}</span>
      <div class="row">
        <select
          value={workspace.activeVersionId}
          onchange={(e) => workspace.setActiveVersion(e.currentTarget.value)}
        >
          {#each profile.versions as v (v.id)}
            <option value={v.id}>{v.name}</option>
          {/each}
        </select>
        <button type="button" onclick={() => workspace.addVersion()}>{t("version.add")}</button>
        <button type="button" onclick={() => workspace.duplicateVersion(version.id)}>
          {t("version.duplicate")}
        </button>
        <button
          type="button"
          class="danger"
          disabled={profile.versions.length <= 1}
          onclick={() => workspace.removeVersion(version.id)}
        >
          {t("version.remove")}
        </button>
      </div>
    </div>

    <div class="grid2">
      <div class="field">
        <span class="lfield-label">{t("version.name")}</span>
        <input
          value={version.name}
          oninput={(e) => (version.name = e.currentTarget.value)}
          onchange={commit}
        />
      </div>
      <div class="field">
        <span class="lfield-label">{t("version.lang")}</span>
        <select
          value={version.lang}
          onchange={(e) => {
            version.lang = e.currentTarget.value;
            commit();
          }}
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </div>
    </div>

    <div class="grid2">
      <div class="field">
        <span class="lfield-label">{t("version.template")}</span>
        <select
          value={version.templateId}
          onchange={(e) => {
            version.templateId = e.currentTarget.value;
            commit();
          }}
        >
          {#each templates as template (template.id)}
            <option value={template.id}>{template.name}</option>
          {/each}
        </select>
      </div>
      <div class="field">
        <span class="lfield-label">{t("version.targetRole")}</span>
        <LocalizedInput value={version.targetRole} />
      </div>
    </div>

    <fieldset class="field">
      <legend>{t("version.sections")}</legend>
      {#each orderedSections as section, i (section.id)}
        <div class="section-row">
          <input
            type="checkbox"
            checked={section.visible}
            onchange={() => toggleSection(section)}
          />
          <span class="section-name">{sectionLabel(section)}</span>
          <button type="button" disabled={i === 0} onclick={() => moveSection(section.id, -1)}>
            {t("version.up")}
          </button>
          <button
            type="button"
            disabled={i === orderedSections.length - 1}
            onclick={() => moveSection(section.id, 1)}
          >
            {t("version.down")}
          </button>
        </div>
      {/each}
    </fieldset>

    <fieldset class="field">
      <legend>{t("version.selection")}</legend>
      <IdPicker
        label={t("editor.tabs.experience")}
        options={experienceOptions}
        selected={version.selection.experienceIds}
      />
      <IdPicker
        label={t("editor.tabs.projects")}
        options={projectOptions}
        selected={version.selection.projectIds}
      />
      <IdPicker
        label={t("editor.tabs.education")}
        options={educationOptions}
        selected={version.selection.educationIds}
      />
      <IdPicker
        label={t("editor.tabs.skills")}
        options={profile.skills.map((s) => ({ id: s.id, label: s.name }))}
        selected={version.selection.skillIds}
      />
      <IdPicker
        label={t("editor.tabs.languages")}
        options={languageOptions}
        selected={version.selection.languageIds}
      />
      <IdPicker
        label={t("editor.tabs.certifications")}
        options={certificationOptions}
        selected={version.selection.certificationIds}
      />
      <IdPicker
        label={t("editor.tabs.achievements")}
        options={achievementOptions}
        selected={version.selection.achievementIds}
      />
    </fieldset>

    <fieldset class="field">
      <legend>{t("version.featured")}</legend>
      <IdPicker
        label={t("editor.tabs.experience")}
        options={experienceOptions}
        selected={version.featured.experienceIds}
      />
      <IdPicker
        label={t("editor.tabs.projects")}
        options={projectOptions}
        selected={version.featured.projectIds}
      />
      <IdPicker
        label={t("editor.tabs.skills")}
        options={profile.skills.map((s) => ({ id: s.id, label: s.name }))}
        selected={version.featured.skillIds}
      />
    </fieldset>
  {/if}
</div>

<style>
  .section-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }
  .section-name {
    font-size: 13px;
  }
</style>
