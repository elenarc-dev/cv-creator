<script lang="ts">
  import { matchOffer } from "$lib/core/matcher";
  import type { JobOffer } from "$lib/domain/schema";
  import { t } from "$lib/i18n/i18n.svelte";
  import { workspace } from "$lib/state/workspace.svelte";

  const profile = $derived(workspace.profile);
  let selectedId = $state<string | null>(null);

  const match = $derived(
    (() => {
      if (!selectedId) return null;
      const offer = profile.offers.find((o) => o.id === selectedId);
      return offer ? matchOffer(profile, offer) : null;
    })(),
  );

  function skillName(id: string): string {
    return profile.skills.find((s) => s.id === id)?.name ?? id;
  }
  function experienceLabel(id: string): string {
    const e = profile.experiences.find((x) => x.id === id);
    return e ? `${e.role.es || ""} · ${e.company}`.trim() : id;
  }
  function projectLabel(id: string): string {
    return profile.projects.find((p) => p.id === id)?.name ?? id;
  }

  function techsText(offer: JobOffer): string {
    return offer.techs.join(", ");
  }
  function setTechs(offer: JobOffer, text: string) {
    offer.techs = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function reqText(offer: JobOffer): string {
    return offer.requirements.join("\n");
  }
  function setReq(offer: JobOffer, text: string) {
    offer.requirements = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function commit() {
    workspace.commit();
  }
</script>

<div class="editor">
  <button type="button" class="add" onclick={() => workspace.addOffer()}>
    + {t("offer.add")}
  </button>

  {#if profile.offers.length === 0}
    <p class="empty">{t("editor.empty")}</p>
  {/if}

  {#each profile.offers as offer (offer.id)}
    <section class="card">
      <header class="card-head">
        <strong>{offer.title || "—"}</strong>
        <button type="button" class="danger" onclick={() => workspace.removeOffer(offer.id)}>
          {t("offer.remove")}
        </button>
      </header>

      <div class="grid2">
        <div class="field">
          <span class="lfield-label">{t("offer.title")}</span>
          <input
            value={offer.title}
            oninput={(e) => (offer.title = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
        <div class="field">
          <span class="lfield-label">{t("offer.company")}</span>
          <input
            value={offer.company}
            oninput={(e) => (offer.company = e.currentTarget.value)}
            onchange={commit}
          />
        </div>
      </div>

      <div class="field">
        <span class="lfield-label">{t("offer.url")}</span>
        <input
          value={offer.url ?? ""}
          oninput={(e) => (offer.url = e.currentTarget.value || undefined)}
          onchange={commit}
        />
      </div>

      <div class="field">
        <span class="lfield-label">{t("offer.description")}</span>
        <textarea
          rows={3}
          value={offer.description}
          oninput={(e) => (offer.description = e.currentTarget.value)}
          onchange={commit}
        ></textarea>
      </div>

      <div class="field">
        <span class="lfield-label">{t("offer.requirements")}</span>
        <textarea
          rows={3}
          value={reqText(offer)}
          oninput={(e) => setReq(offer, e.currentTarget.value)}
          onchange={commit}
        ></textarea>
      </div>

      <div class="field">
        <span class="lfield-label">{t("offer.techs")}</span>
        <input
          value={techsText(offer)}
          oninput={(e) => setTechs(offer, e.currentTarget.value)}
          onchange={commit}
        />
      </div>

      <button type="button" onclick={() => (selectedId = offer.id)}>
        {t("offer.analyze")}
      </button>

      {#if match && selectedId === offer.id}
        <div class="match">
          <p><strong>{t("offer.score")}:</strong> {match.score}</p>
          <p>
            <strong>{t("offer.matchedSkills")}:</strong>
            {#if match.matchedSkillIds.length}
              {match.matchedSkillIds.map(skillName).join(", ")}
            {:else}
              —
            {/if}
          </p>
          <p>
            <strong>{t("offer.missingTechs")}:</strong>
            {#if match.missingTechs.length}
              {match.missingTechs.join(", ")}
            {:else}
              —
            {/if}
          </p>
          <p>
            <strong>{t("offer.relevant")}:</strong>
            {[
              ...match.relevantExperienceIds.map(experienceLabel),
              ...match.relevantProjectIds.map(projectLabel),
            ].join(", ") || "—"}
          </p>
          <button type="button" onclick={() => workspace.applyOfferToVersion(offer.id)}>
            {t("offer.apply")}
          </button>
        </div>
      {/if}
    </section>
  {/each}
</div>

<style>
  .match {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: #f9fafb;
  }
  .match p {
    margin: 4px 0;
  }
</style>
