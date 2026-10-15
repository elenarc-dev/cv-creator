<script lang="ts">
  import CvItem from "$lib/templates/components/CvItem.svelte";
  import type {
    ResolvedAchievement,
    ResolvedItem,
    ResolvedLanguage,
    ResolvedSection,
    ResolvedSkill,
  } from "$lib/core/resolver";
  import type { TemplateComponentProps } from "$lib/templates/types";

  let { doc, options }: TemplateComponentProps = $props();

  const PAGE_ONE_PROJECTS = 4;
  const MAIN_SECTION_IDS = new Set(["experience", "education"]);
  const SIDEBAR_SECTION_IDS = new Set(["certifications"]);

  type ProjectItem = Extract<ResolvedItem, { kind: "project" }>;
  type LanguageItem = Extract<ResolvedItem, { kind: "language" }>;
  type AchievementItem = Extract<ResolvedItem, { kind: "achievement" }>;

  function getSection(id: string): ResolvedSection | undefined {
    return doc.sections.find((section) => section.id === id);
  }

  function sectionsWithIds(ids: Set<string>): ResolvedSection[] {
    return doc.sections.filter((section) => ids.has(section.id));
  }

  function itemKey(item: ResolvedItem): string {
    return item.kind === "summary"
      ? item.kind
      : `${item.kind}-${item.value.id}`;
  }

  function mainSections(): ResolvedSection[] {
    return sectionsWithIds(MAIN_SECTION_IDS);
  }

  function summaryText(): string | undefined {
    const item = getSection("summary")?.items.find(
      (candidate) => candidate.kind === "summary",
    );
    return item?.kind === "summary" ? item.text : undefined;
  }

  function projectItems(): ProjectItem[] {
    return (getSection("projects")?.items ?? []).filter(
      (item): item is ProjectItem => item.kind === "project",
    );
  }

  function projectsForPage(page: 1 | 2): ProjectItem[] {
    const projects = projectItems();
    return page === 1
      ? projects.slice(0, PAGE_ONE_PROJECTS)
      : projects.slice(PAGE_ONE_PROJECTS);
  }

  function paragraphs(value: string): string[] {
    return value
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  function achievementItems(): AchievementItem[] {
    return (getSection("achievements")?.items ?? []).filter(
      (item): item is AchievementItem => item.kind === "achievement",
    );
  }

  function languageItems(): LanguageItem[] {
    return (getSection("languages")?.items ?? []).filter(
      (item): item is LanguageItem => item.kind === "language",
    );
  }

  function skillGroups(): { title: string; skills: ResolvedSkill[] }[] {
    const groups = new Map<string, ResolvedSkill[]>();
    for (const item of getSection("skills")?.items ?? []) {
      if (item.kind !== "skill") continue;
      const title = item.value.category || "Tecnologías";
      groups.set(title, [...(groups.get(title) ?? []), item.value]);
    }
    return [...groups.entries()].map(([title, skills]) => ({ title, skills }));
  }

  function knowledgeGroups(): { title: string; skills: ResolvedSkill[] }[] {
    return skillGroups().filter(
      (group) => group.title === "Backend" || group.title === "Frontend",
    );
  }

  function methodsGroups(): { title: string; skills: ResolvedSkill[] }[] {
    return skillGroups().filter(
      (group) => group.title !== "Backend" && group.title !== "Frontend",
    );
  }

  function languageDotCount(language: ResolvedLanguage): number {
    const level = language.level.toLowerCase();
    if (level.includes("nativ")) return 5;
    if (
      level.includes("compet") ||
      level.includes("c1") ||
      level.includes("c2")
    )
      return 4;
    if (level.includes("avanz") || level.includes("b2")) return 3;
    if (level.includes("inter") || level.includes("b1")) return 2;
    return 1;
  }

  function linkIcon(type: string): string {
    if (type === "linkedin") return "in";
    if (type === "github") return "◉";
    return "↗";
  }

  function sidebarSections(): ResolvedSection[] {
    return sectionsWithIds(SIDEBAR_SECTION_IDS);
  }
</script>

<div
  class="cv-document cv-document--elena"
  style={`font-family: ${options.fontFamily}; font-size: ${options.baseFontSize};`}
>
  <section class="elena-page elena-page--first">
    <main class="elena-main">
      <header class="elena-header">
        <h1>
          {[doc.personal.firstName, doc.personal.lastName]
            .filter(Boolean)
            .join(" ")}
        </h1>
        {#if doc.personal.headline}<div class="elena-role">
            {doc.personal.headline}
          </div>{/if}

        {#if doc.personal.phone || doc.personal.email || doc.personal.location || doc.personal.links.length}
          <div class="elena-contact">
            {#if doc.personal.phone}<div>
                <span class="elena-icon">♧</span>{doc.personal.phone}
              </div>{/if}
            {#if doc.personal.email}<div>
                <span class="elena-icon">✉</span>{doc.personal.email}
              </div>{/if}
            {#if doc.personal.location}<div>
                <span class="elena-icon">⌖</span>{doc.personal.location}
              </div>{/if}
            {#each doc.personal.links as link (link.url + link.type)}
              <div class="elena-link">
                <span class="elena-icon">{linkIcon(link.type)}</span><a
                  href={link.url}>{link.url}</a
                >
              </div>
            {/each}
          </div>
        {/if}
      </header>

      {#if summaryText()}
        <div class="elena-intro">
          {#each paragraphs(summaryText() ?? "") as paragraph}<p>
              {paragraph}
            </p>{/each}
        </div>
      {/if}

      {#each mainSections() as section (section.id)}
        <section class="elena-section elena-section--{section.id}">
          <h2 class="elena-section-title">{section.title}</h2>
          <div class="elena-section-items">
            {#each section.items as item (itemKey(item))}<CvItem
                {doc}
                {item}
              />{/each}
          </div>
        </section>
      {/each}

      {#if projectsForPage(1).length}
        <section class="elena-section elena-section--projects">
          <h2 class="elena-section-title">
            {getSection("projects")?.title ?? "Proyectos"}
          </h2>
          <div class="elena-section-items">
            {#each projectsForPage(1) as item (itemKey(item))}<CvItem
                {doc}
                {item}
              />{/each}
          </div>
        </section>
      {/if}
    </main>

    <aside class="elena-sidebar">
      {#if doc.personal.photo}
        <div class="elena-photo">
          <img
            src={doc.personal.photo}
            alt={[doc.personal.firstName, doc.personal.lastName]
              .filter(Boolean)
              .join(" ")}
          />
        </div>
      {/if}

      {#if achievementItems().length}
        <section class="elena-side-section">
          <h2 class="elena-side-title">
            {getSection("achievements")?.title ?? "Logros"}
          </h2>
          {#each achievementItems() as item (item.value.id)}
            <div class="elena-achievement">
              <strong>✦ {item.value.title}</strong><br />{item.value
                .description}
            </div>
          {/each}
        </section>
      {/if}

      {#if languageItems().length}
        <section class="elena-side-section">
          <h2 class="elena-side-title">
            {getSection("languages")?.title ?? "Idiomas"}
          </h2>
          <div class="elena-languages">
            {#each languageItems() as item (item.value.id)}
              <div class="elena-language">
                <span class="elena-language-name">{item.value.name}</span>
                <span class="elena-language-level">{item.value.level}</span>
                <span class="elena-dots" aria-label={item.value.level}>
                  {#each [0, 1, 2, 3, 4] as dot}<span
                      class:filled={dot < languageDotCount(item.value)}>●</span
                    >{/each}
                </span>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      {#if knowledgeGroups().length}
        <section class="elena-side-section">
          <h2 class="elena-side-title">Conocimientos</h2>
          <div class="elena-skills">
            {#each knowledgeGroups() as group (group.title)}
              <div class="elena-skill-column">
                <div><strong>{group.title}</strong></div>
                {#each group.skills as skill (skill.id)}<div>
                    {skill.name}
                  </div>{/each}
              </div>
            {/each}
          </div>
        </section>
      {/if}

      {#if methodsGroups().length}
        <section class="elena-side-section elena-methods">
          <h2 class="elena-side-title">Metodologías</h2>
          <div class="elena-skill-column">
            {#each methodsGroups() as group (group.title)}
              {#each group.skills as skill (skill.id)}<div>
                  {skill.name}
                </div>{/each}
            {/each}
          </div>
        </section>
      {/if}

      {#each sidebarSections() as section (section.id)}
        <section class="elena-side-section elena-side-section--{section.id}">
          <h2 class="elena-side-title">{section.title}</h2>
          <div class="elena-section-items">
            {#each section.items as item (itemKey(item))}<CvItem
                {doc}
                {item}
              />{/each}
          </div>
        </section>
      {/each}
    </aside>
  </section>

  {#if projectsForPage(2).length}
    <section class="elena-page elena-page--second">
      <main class="elena-main">
        <section class="elena-section elena-section--projects">
          <h2 class="elena-section-title">
            {getSection("projects")?.title ?? "Proyectos"}
          </h2>
          <div class="elena-section-items">
            {#each projectsForPage(2) as item (itemKey(item))}{#if !item.value.hidden}<CvItem
                  {doc}
                  {item}
                />{/if}{/each}
          </div>
        </section>
      </main>
      <aside class="elena-sidebar" aria-hidden="true"></aside>
    </section>
  {/if}
</div>
