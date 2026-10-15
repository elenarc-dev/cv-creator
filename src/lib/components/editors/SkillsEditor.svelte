<script lang="ts">
  import DateInput from "$lib/components/fields/DateInput.svelte";
  import LocalizedTextarea from "$lib/components/fields/LocalizedTextarea.svelte";
  import type { SkillLevel } from "$lib/domain/schema";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";

  const profile = $derived(workspace.profile);
  const levels: SkillLevel[] = ["basic", "intermediate", "advanced", "expert"];
  let expandedSkills = $state(new Set<string>());

  function toggleSkill(id: string) {
    if (expandedSkills.has(id)) expandedSkills.delete(id);
    else expandedSkills.add(id);
    expandedSkills = new Set(expandedSkills);
  }

  function commit() {
    workspace.commit();
  }
</script>

<div class="editor">
  <button type="button" class="add" onclick={() => workspace.addSkill()}>
    + {t("editor.add")}
  </button>

  {#if profile.skills.length === 0}
    <p class="empty">{t("editor.empty")}</p>
  {/if}

  {#each profile.skills as skill (skill.id)}
    <section class="card">
      <header class="card-head">
        <strong>{skill.name || "—"}</strong>
        <div class="card-actions">
          <button
            type="button"
            class="skill-toggle"
            aria-expanded={expandedSkills.has(skill.id)}
            aria-controls={`skill-details-${skill.id}`}
            onclick={() => toggleSkill(skill.id)}
          >
            {expandedSkills.has(skill.id) ? t("editor.collapse") : t("editor.expand")}
          </button>
          <button type="button" class="danger" onclick={() => workspace.removeSkill(skill.id)}>
            {t("editor.remove")}
          </button>
        </div>
      </header>

      <div class="grid3">
        <div class="field">
          <span class="lfield-label">{t("fields.name")}</span>
          <input
            value={skill.name}
            oninput={(e) => (skill.name = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.category")}</span>
          <input
            value={skill.category}
            oninput={(e) => (skill.category = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.level")}</span>
          <select
            value={skill.level}
            onchange={(e) => {
              skill.level = (e.currentTarget as HTMLSelectElement).value as SkillLevel;
              commit();
            }}
          >
            {#each levels as level (level)}
              <option value={level}>{t(`level.${level}`)}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if expandedSkills.has(skill.id)}
        <div id={`skill-details-${skill.id}`}>
          <div class="grid2">
            <div class="field">
              <span class="lfield-label">{t("fields.years")}</span>
              <input
                type="number"
                min="0"
                value={skill.years ?? ""}
                oninput={(e) => (skill.years = Number(e.currentTarget.value) || undefined)}
                onchange={commit}
              />
            </div>
            <DateInput
              label={t("fields.lastUsed")}
              value={skill.lastUsed}
              onValue={(value) => (skill.lastUsed = value || undefined)}
            />
          </div>

          <LocalizedTextarea label={t("fields.description")} value={skill.description} />
        </div>
      {/if}
    </section>
  {/each}
</div>
