<script lang="ts">
  import DateInput from "$lib/components/fields/DateInput.svelte";
  import type { Certification } from "$lib/domain/schema";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";
  import { openImageDialog } from "$lib/tauri/io";

  const profile = $derived(workspace.profile);

  function commit() {
    workspace.commit();
  }

  async function pickImage(cert: Certification) {
    const uri = await openImageDialog();
    if (uri) {
      cert.image = uri;
      commit();
    }
  }

  function removeImage(cert: Certification) {
    cert.image = undefined;
    commit();
  }
</script>

<div class="editor">
  <button type="button" class="add" onclick={() => workspace.addCertification()}>
    + {t("editor.add")}
  </button>

  {#if profile.certifications.length === 0}
    <p class="empty">{t("editor.empty")}</p>
  {/if}

  {#each profile.certifications as cert (cert.id)}
    <section class="card">
      <header class="card-head">
        <strong>{cert.name || "—"}</strong>
        <button type="button" class="danger" onclick={() => workspace.removeCertification(cert.id)}>
          {t("editor.remove")}
        </button>
      </header>

      <div class="grid2">
        <div class="field">
          <span class="lfield-label">{t("fields.name")}</span>
          <input
            value={cert.name}
            oninput={(e) => (cert.name = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.organization")}</span>
          <input
            value={cert.organization}
            oninput={(e) => (cert.organization = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
      </div>

      <div class="grid2">
        <DateInput
          label={t("fields.issueDate")}
          value={cert.issueDate}
          onValue={(value) => (cert.issueDate = value || undefined)}
        />
        <DateInput
          label={t("fields.expiryDate")}
          value={cert.expiryDate}
          onValue={(value) => (cert.expiryDate = value || undefined)}
        />
      </div>

      <div class="grid2">
        <div class="field">
          <span class="lfield-label">{t("fields.credentialId")}</span>
          <input
            value={cert.credentialId ?? ""}
            oninput={(e) => (cert.credentialId = e.currentTarget.value || undefined)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("fields.url")}</span>
          <input
            value={cert.url ?? ""}
            placeholder="https://"
            oninput={(e) => (cert.url = e.currentTarget.value || undefined)}
            onchange={commit}
          />
        </div>
      </div>

      <div class="field">
        <span class="lfield-label">{t("fields.image")}</span>
        {#if cert.image}
          <img class="photo-preview" src={cert.image} alt="" />
        {/if}
        <div class="row">
          <button type="button" onclick={() => pickImage(cert)}>{t("fields.imagePick")}</button>
          {#if cert.image}
            <button type="button" onclick={() => removeImage(cert)}>{t("fields.imageRemove")}</button>
          {/if}
        </div>
      </div>
    </section>
  {/each}
</div>
