<script lang="ts">
  import { formatCvDate, formatDateRange } from "$lib/core/dates";
  import type { CvDocument, ResolvedItem } from "$lib/core/resolver";

  let { doc, item }: { doc: CvDocument; item: ResolvedItem } = $props();

  function dateRange(start?: string, end?: string): string {
    return formatDateRange(start, end, doc.labels.present);
  }

  function datePair(first?: string, second?: string): string {
    const values = [formatCvDate(first), formatCvDate(second)].filter(Boolean);
    return values.join(" — ");
  }

  function meta(parts: (string | undefined)[]): string {
    return parts.filter((part): part is string => Boolean(part)).join(" · ");
  }

  function paragraphs(value: string): string[] {
    return value
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }
</script>

{#if item.kind === "summary"}
  <p class="cv-summary cv-summary--standalone">{item.text}</p>
{:else if item.kind === "experience"}
  <article class:featured={item.value.featured} class="cv-entry">
    <div class="cv-entry-head">
      <span class="cv-role">{item.value.role}</span>
      <span class="cv-company">{item.value.company}</span>
      <span class="cv-meta">{meta([dateRange(item.value.start, item.value.end), item.value.location, item.value.mode ? doc.labels.workMode[item.value.mode] : undefined])}</span>
    </div>
    {#if item.value.summary}<p class="cv-summary">{item.value.summary}</p>{/if}
    {#each paragraphs(item.value.description) as paragraph}<p>{paragraph}</p>{/each}
    {#if item.value.responsibilities.length}
      <ul class="cv-list">
        {#each item.value.responsibilities as responsibility}<li>{responsibility}</li>{/each}
      </ul>
    {/if}
    {#if item.value.skills.length}
      <div class="cv-chips">
        {#each item.value.skills as skill (skill.id)}<span class="cv-chip">{skill.name}</span>{/each}
      </div>
    {/if}
    {#if item.value.achievements.length}
      <ul class="cv-achievements">
        {#each item.value.achievements as achievement (achievement.id)}
          <li><strong>{achievement.title}</strong>{#if achievement.metric} <span class="cv-metric">({achievement.metric})</span>{/if}</li>
        {/each}
      </ul>
    {/if}
  </article>
{:else if item.kind === "project"}
  <article class:featured={item.value.featured} class="cv-entry">
    <div class="cv-entry-head">
      <span class="cv-role">{item.value.name}</span>
      {#if item.value.role}<span class="cv-company">{item.value.role}</span>{/if}
      <span class="cv-meta">{meta([dateRange(item.value.start, item.value.end), item.value.company, item.value.client])}</span>
    </div>
    {#if item.value.description}{#each paragraphs(item.value.description) as paragraph}<p>{paragraph}</p>{/each}{/if}
    {#if item.value.responsibilities.length}
      <ul class="cv-list">
        {#each item.value.responsibilities as responsibility}<li>{responsibility}</li>{/each}
      </ul>
    {/if}
    {#if item.value.skills.length}
      <div class="cv-chips">
        {#each item.value.skills as skill (skill.id)}<span class="cv-chip">{skill.name}</span>{/each}
      </div>
    {/if}
  </article>
{:else if item.kind === "education"}
  <article class="cv-entry">
    <div class="cv-entry-head">
      <span class="cv-role">{item.value.degree}</span>
      <span class="cv-company">{item.value.institution}</span>
      <span class="cv-meta">{meta([dateRange(item.value.start, item.value.end), item.value.location])}</span>
    </div>
    {#each paragraphs(item.value.description) as paragraph}<p>{paragraph}</p>{/each}
  </article>
{:else if item.kind === "skill"}
  <span class="cv-skill" title={item.value.years ? `${item.value.years} ${doc.labels.years}` : ""}>
    <span class="cv-skill-name">{item.value.name}</span>
    <span class="cv-dots">
      {#each [0, 1, 2, 3] as dot}<span class:filled={dot < ({ basic: 1, intermediate: 2, advanced: 3, expert: 4 }[item.value.level] ?? 2)} class="dot"></span>{/each}
    </span>
  </span>
{:else if item.kind === "language"}
  <article class="cv-entry">
    <div class="cv-entry-head">
      <span class="cv-role">{item.value.name}</span>
      <span class="cv-meta">{item.value.level}</span>
    </div>
    {#if item.value.certification}<span class="cv-chip">{item.value.certification}</span>{/if}
    {#each paragraphs(item.value.description) as paragraph}<p>{paragraph}</p>{/each}
  </article>
{:else if item.kind === "certification"}
  <article class="cv-entry">
    <div class="cv-entry-head">
      <span class="cv-role">{item.value.name}</span>
      <span class="cv-company">{item.value.organization}</span>
      <span class="cv-meta">{meta([datePair(item.value.issueDate, item.value.expiryDate), item.value.credentialId])}</span>
    </div>
    {#if item.value.url}<a href={item.value.url}>URL</a>{/if}
  </article>
{:else if item.kind === "achievement"}
  <article class="cv-entry">
    <div class="cv-entry-head">
      <span class="cv-role">{item.value.title}</span>
      {#if item.value.metric}<span class="cv-metric">({item.value.metric})</span>{/if}
      {#if item.value.date}<span class="cv-meta">{formatCvDate(item.value.date)}</span>{/if}
    </div>
    {#each paragraphs(item.value.description) as paragraph}<p>{paragraph}</p>{/each}
  </article>
{/if}
