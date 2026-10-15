<script lang="ts">
  import EducationEditor from "$lib/components/editors/EducationEditor.svelte";
  import ExperienceEditor from "$lib/components/editors/ExperienceEditor.svelte";
  import JobOffersEditor from "$lib/components/editors/JobOffersEditor.svelte";
  import LanguagesEditor from "$lib/components/editors/LanguagesEditor.svelte";
  import PersonalEditor from "$lib/components/editors/PersonalEditor.svelte";
  import ProjectsEditor from "$lib/components/editors/ProjectsEditor.svelte";
  import SkillsEditor from "$lib/components/editors/SkillsEditor.svelte";
  import VersionEditor from "$lib/components/editors/VersionEditor.svelte";
  import { t } from "$lib/i18n/i18n.svelte";

  const tabs = [
    { id: "personal", labelKey: "editor.tabs.personal", component: PersonalEditor },
    { id: "experience", labelKey: "editor.tabs.experience", component: ExperienceEditor },
    { id: "projects", labelKey: "editor.tabs.projects", component: ProjectsEditor },
    { id: "education", labelKey: "editor.tabs.education", component: EducationEditor },
    { id: "skills", labelKey: "editor.tabs.skills", component: SkillsEditor },
    { id: "languages", labelKey: "editor.tabs.languages", component: LanguagesEditor },
    { id: "version", labelKey: "editor.tabs.version", component: VersionEditor },
    { id: "offers", labelKey: "editor.tabs.offers", component: JobOffersEditor },
  ];

  let active = $state("personal");
  const Active = $derived(tabs.find((tab) => tab.id === active)?.component);
</script>

<div class="editor-shell">
  <nav class="tabs">
    {#each tabs as tab (tab.id)}
      <button class:on={active === tab.id} onclick={() => (active = tab.id)}>
        {t(tab.labelKey)}
      </button>
    {/each}
  </nav>
  <div class="editor-body">
    {#if Active}
      <Active />
    {/if}
  </div>
</div>
