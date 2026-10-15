<script lang="ts">
  import LocalizedInput from "$lib/components/fields/LocalizedInput.svelte";
  import type { LinkType } from "$lib/domain/schema";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";
  import { openImageDialog } from "$lib/tauri/io";

  const p = $derived(workspace.profile.personal);
  const linkTypes: LinkType[] = ["linkedin", "github", "portfolio", "website", "other"];

  async function pickPhoto() {
    const uri = await openImageDialog();
    if (uri) {
      p.photo = uri;
      workspace.commit();
    }
  }
  function removePhoto() {
    p.photo = undefined;
    workspace.commit();
  }
</script>

<div class="editor">
  <LocalizedInput label={t("fields.firstName")} value={p.firstName} />
  <LocalizedInput label={t("fields.lastName")} value={p.lastName} />
  <LocalizedInput label={t("fields.headline")} value={p.headline} />

  <div class="grid2">
    <div class="field">
      <span class="lfield-label">{t("fields.email")}</span>
      <input
        type="email"
        value={p.email ?? ""}
        oninput={(e) => (p.email = e.currentTarget.value)}
        onchange={() => workspace.commit()}
      />
    </div>
    <div class="field">
      <span class="lfield-label">{t("fields.phone")}</span>
      <input
        value={p.phone ?? ""}
        oninput={(e) => (p.phone = e.currentTarget.value)}
        onchange={() => workspace.commit()}
      />
    </div>
  </div>

  <LocalizedInput label={t("fields.location")} value={p.location} />

  <div class="field">
    <span class="lfield-label">{t("fields.photo")}</span>
    {#if p.photo}
      <img class="photo-preview" src={p.photo} alt="foto" />
    {/if}
    <div class="row">
      <button type="button" onclick={pickPhoto}>{t("fields.photoPick")}</button>
      {#if p.photo}
        <button type="button" onclick={removePhoto}>{t("fields.photoRemove")}</button>
      {/if}
    </div>
  </div>

  <fieldset class="field">
    <legend>{t("fields.links")}</legend>
    {#each p.links as link, i (link.id)}
      <div class="link-row">
        <select
          value={link.type}
          onchange={(e) => {
            link.type = (e.currentTarget as HTMLSelectElement).value as LinkType;
            workspace.commit();
          }}
        >
          {#each linkTypes as type (type)}
            <option value={type}>{type}</option>
          {/each}
        </select>
        <input
          value={link.url}
          placeholder="https://"
          oninput={(e) => (link.url = e.currentTarget.value)}
          onchange={() => workspace.commit()}
        />
        <button type="button" class="danger" onclick={() => workspace.removeLink(i)}>✕</button>
      </div>
    {/each}
    <button type="button" onclick={() => workspace.addLink()}>{t("fields.addLink")}</button>
  </fieldset>
</div>
