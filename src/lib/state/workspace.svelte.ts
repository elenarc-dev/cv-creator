import { matchOffer } from "../core/matcher";
import { selectAll } from "../core/selection";
import {
  createAchievement,
  createCertification,
  createCvVersion,
  createEducation,
  createExperience,
  createJobOffer,
  createLanguage,
  createProfile,
  createProject,
  createSkill,
  newId,
} from "../domain/defaults";
import type { CvVersion, Link, Profile, Project } from "../domain/schema";
import { parseProfile } from "../import/json";
import { createBackup, loadWorkspace, saveWorkspace } from "../tauri/io";
import { createHistory } from "./history";

export type SaveState = "idle" | "saving" | "saved" | "error";

class WorkspaceStore {
  profile = $state<Profile>(createProfile());
  activeVersionId = $state("");
  loaded = $state(false);
  saveState = $state<SaveState>("idle");
  canUndo = $state(false);
  canRedo = $state(false);

  private history = createHistory<string>(JSON.stringify(this.profile));
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  private refreshFlags(): void {
    this.canUndo = this.history.canUndo();
    this.canRedo = this.history.canRedo();
  }

  private scheduleSave(): void {
    this.saveState = "saving";
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(async () => {
      try {
        await saveWorkspace(JSON.stringify(this.profile));
        this.saveState = "saved";
      } catch {
        this.saveState = "error";
      }
    }, 800);
  }

  /** Registra el estado actual en el historial y programa el autosave. */
  commit(): void {
    this.history.push(JSON.stringify(this.profile));
    this.refreshFlags();
    this.scheduleSave();
  }

  undo(): void {
    const prev = this.history.undo();
    if (prev) {
      this.profile = JSON.parse(prev);
      this.refreshFlags();
      this.scheduleSave();
    }
  }

  redo(): void {
    const next = this.history.redo();
    if (next) {
      this.profile = JSON.parse(next);
      this.refreshFlags();
      this.scheduleSave();
    }
  }

  async init(): Promise<void> {
    try {
      const json = await loadWorkspace();
      this.profile = json ? parseProfile(json) : createProfile();
    } catch {
      this.profile = createProfile();
    }
    this.activeVersionId = this.profile.versions[0]?.id ?? "";
    this.history = createHistory(JSON.stringify(this.profile));
    this.refreshFlags();
    this.loaded = true;
  }

  replaceProfile(next: Profile): void {
    this.profile = next;
    this.activeVersionId = next.versions[0]?.id ?? "";
    this.commit();
  }

  activeVersion(): CvVersion | undefined {
    return this.profile.versions.find((v) => v.id === this.activeVersionId);
  }

  setActiveVersion(id: string): void {
    if (this.profile.versions.some((v) => v.id === id)) this.activeVersionId = id;
  }

  addVersion(): void {
    const v = createCvVersion();
    v.name = `CV ${this.profile.versions.length + 1}`;
    this.profile.versions.push(selectAll(this.profile, v));
    this.activeVersionId = v.id;
    this.commit();
  }

  duplicateVersion(id: string): void {
    const src = this.profile.versions.find((v) => v.id === id);
    if (!src) return;
    const copy: CvVersion = structuredClone(src);
    copy.id = newId();
    copy.name = `${src.name} (copia)`;
    this.profile.versions.push(copy);
    this.activeVersionId = copy.id;
    this.commit();
  }

  removeVersion(id: string): void {
    if (this.profile.versions.length <= 1) return;
    this.profile.versions = this.profile.versions.filter((v) => v.id !== id);
    if (this.activeVersionId === id) this.activeVersionId = this.profile.versions[0]?.id ?? "";
    this.commit();
  }

  renameVersion(id: string, name: string): void {
    const v = this.profile.versions.find((x) => x.id === id);
    if (v) {
      v.name = name;
      this.commit();
    }
  }

  makeBackup(): Promise<string> {
    return createBackup();
  }

  // ---------- acciones de entidades ----------

  addExperience() {
    const e = createExperience();
    this.profile.experiences.push(e);
    this.activeVersion()?.selection.experienceIds.push(e.id);
    this.commit();
  }
  addProject() {
    const p = createProject();
    // p.order = this.profile.projects[this.profile.projects.length - 1].order || 0
    this.profile.projects.push(p);
    this.activeVersion()?.selection.projectIds.push(p.id);
    this.commit();
  }
  reorderProject(idx: number, top: boolean) {
    let aux = [...this.profile.projects]
    if (top) {
      [aux[idx - 1], aux[idx]] = [aux[idx], aux[idx - 1]]
    } else {
      [aux[idx + 1], aux[idx]] = [aux[idx], aux[idx + 1]]
    }
    this.profile.projects = aux
  }
  addEducation() {
    const e = createEducation();
    this.profile.education.push(e);
    this.activeVersion()?.selection.educationIds.push(e.id);
    this.commit();
  }
  addSkill() {
    const s = createSkill();
    this.profile.skills.push(s);
    this.activeVersion()?.selection.skillIds.push(s.id);
    this.commit();
  }
  addLanguage() {
    const l = createLanguage();
    this.profile.languages.push(l);
    this.activeVersion()?.selection.languageIds.push(l.id);
    this.commit();
  }
  addCertification() {
    const c = createCertification();
    this.profile.certifications.push(c);
    this.activeVersion()?.selection.certificationIds.push(c.id);
    this.commit();
  }
  addAchievement() {
    const a = createAchievement();
    this.profile.achievements.push(a);
    this.activeVersion()?.selection.achievementIds.push(a.id);
    this.commit();
  }
  addLink() {
    const link: Link = { id: crypto.randomUUID(), type: "linkedin", url: "" };
    this.profile.personal.links.push(link);
    this.commit();
  }

  private removeFromAllVersions(id: string): void {
    for (const v of this.profile.versions) {
      v.selection.experienceIds = v.selection.experienceIds.filter((x) => x !== id);
      v.selection.projectIds = v.selection.projectIds.filter((x) => x !== id);
      v.selection.educationIds = v.selection.educationIds.filter((x) => x !== id);
      v.selection.skillIds = v.selection.skillIds.filter((x) => x !== id);
      v.selection.languageIds = v.selection.languageIds.filter((x) => x !== id);
      v.selection.certificationIds = v.selection.certificationIds.filter((x) => x !== id);
      v.selection.achievementIds = v.selection.achievementIds.filter((x) => x !== id);
      v.featured.experienceIds = v.featured.experienceIds.filter((x) => x !== id);
      v.featured.projectIds = v.featured.projectIds.filter((x) => x !== id);
      v.featured.skillIds = v.featured.skillIds.filter((x) => x !== id);
      delete v.overrides[id];
    }
  }

  removeExperience(id: string) {
    this.profile.experiences = this.profile.experiences.filter((e) => e.id !== id);
    this.removeFromAllVersions(id);
    this.commit();
  }
  removeProject(id: string) {
    this.profile.projects = this.profile.projects.filter((p) => p.id !== id);
    this.removeFromAllVersions(id);
    this.commit();
  }
  removeEducation(id: string) {
    this.profile.education = this.profile.education.filter((e) => e.id !== id);
    this.removeFromAllVersions(id);
    this.commit();
  }
  removeSkill(id: string) {
    this.profile.skills = this.profile.skills.filter((s) => s.id !== id);
    this.removeFromAllVersions(id);
    this.commit();
  }
  removeLanguage(id: string) {
    this.profile.languages = this.profile.languages.filter((l) => l.id !== id);
    this.removeFromAllVersions(id);
    this.commit();
  }
  removeCertification(id: string) {
    this.profile.certifications = this.profile.certifications.filter((c) => c.id !== id);
    this.removeFromAllVersions(id);
    this.commit();
  }
  removeAchievement(id: string) {
    this.profile.achievements = this.profile.achievements.filter((a) => a.id !== id);
    this.removeFromAllVersions(id);
    this.commit();
  }
  removeLink(index: number) {
    this.profile.personal.links.splice(index, 1);
    this.commit();
  }

  addOffer() {
    this.profile.offers.push(createJobOffer());
    this.commit();
  }

  removeOffer(id: string) {
    this.profile.offers = this.profile.offers.filter((o) => o.id !== id);
    this.commit();
  }

  /** Aplica las coincidencias de una oferta a la versión activa. */
  applyOfferToVersion(offerId: string): void {
    const offer = this.profile.offers.find((o) => o.id === offerId);
    const version = this.activeVersion();
    if (!offer || !version) return;
    const match = matchOffer(this.profile, offer);
    version.selection.skillIds = match.matchedSkillIds;
    version.selection.experienceIds = match.relevantExperienceIds;
    version.selection.projectIds = match.relevantProjectIds;
    version.featured.skillIds = match.matchedSkillIds;
    this.commit();
  }
}

export const workspace = new WorkspaceStore();
