<script lang="ts">
  import { resolveCv } from "$lib/core/resolver";
  import { workspace } from "$lib/state/workspace.svelte";
  import { getTemplateComponent } from "$lib/templates/component-registry";
  import { getTemplate } from "$lib/templates/registry";

  const version = $derived(
    workspace.loaded ? workspace.activeVersion() : undefined,
  );
  const template = $derived(
    version ? getTemplate(version.templateId) : undefined,
  );
  const component = $derived(
    template ? getTemplateComponent(template.id) : undefined,
  );
  const doc = $derived(
    version && template ? resolveCv(workspace.profile, version) : null,
  );
  const stylesheet = $derived(
    template ? template.css(template.defaultOptions) : "",
  );
</script>

<svelte:head>
  {@html stylesheet ? `<style data-cv-template>${stylesheet}</style>` : ""}
</svelte:head>

<div class="preview">
  {#if doc && template && component}
    {@const TemplateComponent = component}
    <TemplateComponent {doc} options={template.defaultOptions} />
  {:else}
    <p class="empty-preview">Sin versión de CV.</p>
  {/if}
</div>

<style>
  .preview {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: auto;
    padding: 20px;
    background: #e5e7eb;
  }

  .empty-preview {
    margin: 0;
    color: #6b7280;
  }
</style>
