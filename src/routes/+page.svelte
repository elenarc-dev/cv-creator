<script lang="ts">
  import { onMount } from "svelte";
  import Editor from "$lib/components/Editor.svelte";
  import Preview from "$lib/components/Preview.svelte";
  import { resolveCv } from "$lib/core/resolver";
  import type { CvDocument } from "$lib/core/resolver";
  import { exportHtmlPackage, exportHtmlStandalone } from "$lib/export/html";
  import { exportProfileJson } from "$lib/export/json";
  import { printCv } from "$lib/export/pdf";
  import { getLang, setLang, t } from "$lib/i18n/i18n.svelte";
  import { importProfileFromFile } from "$lib/import/json";
  import { parseMarkdown } from "$lib/import/markdown";
  import { workspace } from "$lib/state/workspace.svelte";
  import { openTextFileDialog } from "$lib/tauri/io";
  import { getTemplate } from "$lib/templates/registry";
  import type { Template } from "$lib/templates/types";

  onMount(() => {
    workspace.init();
  });

  const currentLang = $derived(getLang());
  let previewRoot: HTMLElement;

  function renderedBody(): string {
    return previewRoot?.querySelector<HTMLElement>(".cv-document")?.outerHTML ?? "";
  }

  function current(): { doc: CvDocument; template: Template } | null {
    const version = workspace.activeVersion();
    if (!version) return null;
    const template = getTemplate(version.templateId);
    if (!template) return null;
    return { doc: resolveCv(workspace.profile, version), template };
  }

  async function onExportHtml() {
    const c = current();
    const body = renderedBody();
    if (c && body) await exportHtmlStandalone(body, c.doc, c.template);
  }
  async function onExportPackage() {
    const c = current();
    const body = renderedBody();
    if (c && body) await exportHtmlPackage(body, c.doc, c.template);
  }
  function onExportPdf() {
    const c = current();
    const body = renderedBody();
    if (c && body) printCv(body, c.doc, c.template);
  }
  async function onExportJson() {
    await exportProfileJson(workspace.profile);
  }
  async function onImportJson() {
    try {
      const p = await importProfileFromFile();
      if (p) workspace.replaceProfile(p);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    }
  }
  async function onImportMarkdown() {
    try {
      const res = await openTextFileDialog({
        filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
      });
      if (res) workspace.replaceProfile(parseMarkdown(res.content));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    }
  }
  async function onBackup() {
    try {
      await workspace.makeBackup();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    }
  }

  function onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
    ) {
      return;
    }
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;
    const key = event.key.toLowerCase();
    if (key === "z") {
      event.preventDefault();
      if (event.shiftKey) workspace.redo();
      else workspace.undo();
    } else if (key === "y") {
      event.preventDefault();
      workspace.redo();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="app">
  <header class="toolbar">
    <span class="title">{t("app.title")}</span>

    <button onclick={() => setLang("es")} class:on={currentLang === "es"}>ES</button>
    <button onclick={() => setLang("en")} class:on={currentLang === "en"}>EN</button>

    <span class="spacer"></span>

    <button onclick={() => workspace.undo()} disabled={!workspace.canUndo}>
      {t("toolbar.undo")}
    </button>
    <button onclick={() => workspace.redo()} disabled={!workspace.canRedo}>
      {t("toolbar.redo")}
    </button>
    <button onclick={onBackup}>{t("toolbar.backup")}</button>
    <button onclick={onImportJson}>{t("import.json")}</button>
    <button onclick={onImportMarkdown}>{t("import.markdown")}</button>
    <button onclick={onExportHtml}>{t("export.html")}</button>
    <button onclick={onExportPackage}>{t("export.htmlPackage")}</button>
    <button onclick={onExportPdf}>{t("export.pdf")}</button>
    <button onclick={onExportJson}>{t("export.json")}</button>

    <span class="status">{t(`save.${workspace.saveState}`)}</span>
  </header>

  <div class="split">
    <aside class="editor-pane">
      {#if workspace.loaded}
        <Editor />
      {/if}
    </aside>
    <section class="preview-pane" bind:this={previewRoot}>
      <Preview />
    </section>
  </div>
</div>
