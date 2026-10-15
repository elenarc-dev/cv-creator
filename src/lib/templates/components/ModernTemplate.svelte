<script lang="ts">
  import CvItem from "$lib/templates/components/CvItem.svelte";
  import type { ResolvedItem } from "$lib/core/resolver";
  import type { TemplateComponentProps } from "$lib/templates/types";

  let { doc, options }: TemplateComponentProps = $props();

  function itemKey(item: ResolvedItem): string {
    return item.kind === "summary" ? item.kind : `${item.kind}-${item.value.id}`;
  }
</script>

<div class="cv-document" style={`font-family: ${options.fontFamily}; font-size: ${options.baseFontSize};`}>
  <header class="cv-header">
    <div class="cv-header-main">
      <h1 class="cv-name">{[doc.personal.firstName, doc.personal.lastName].filter(Boolean).join(" ")}</h1>
      {#if doc.personal.headline}<div class="cv-headline">{doc.personal.headline}</div>{/if}
      {#if doc.personal.phone || doc.personal.email || doc.personal.location}
        <div class="cv-contact">
          {#each [doc.personal.phone, doc.personal.email, doc.personal.location].filter((item): item is string => Boolean(item)) as contact, i}
            {#if i > 0}<span class="sep">·</span>{/if}<span>{contact}</span>
          {/each}
        </div>
      {/if}
      {#if doc.personal.links.length}
        <div class="cv-links">
          {#each doc.personal.links as link, i (link.url + link.type)}
            {#if i > 0}<span class="sep">·</span>{/if}
            <a class="cv-link" href={link.url}>{link.label ?? doc.labels.linkTypes[link.type]}</a>
          {/each}
        </div>
      {/if}
    </div>
    {#if doc.personal.photo}<img class="cv-photo" src={doc.personal.photo} alt={[doc.personal.firstName, doc.personal.lastName].filter(Boolean).join(" ")} />{/if}
  </header>

  {#each doc.sections as section (section.id)}
    <section class="cv-section cv-section--{section.id}">
      <h2 class="cv-section-title">{section.title}</h2>
      <div class:cv-skills={section.id === "skills"} class:cv-section-items={section.id !== "skills"}>
        {#each section.items as item (itemKey(item))}
          <CvItem {doc} {item} />
        {/each}
      </div>
    </section>
  {/each}
</div>
