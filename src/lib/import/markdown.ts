import { selectAll } from "../core/selection";
import {
  createCertification,
  createEducation,
  createExperience,
  createLanguage,
  createProfile,
  createProject,
  createSkill,
} from "../domain/defaults";
import type { Profile } from "../domain/schema";
import type { Importer } from "./types";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const EXPERIENCE = new Set([
  "experience",
  "work experience",
  "experiencia",
  "experiencia laboral",
  "empleo",
]);
const EDUCATION = new Set(["education", "formacion", "educacion"]);
const SKILLS = new Set([
  "skills",
  "technologies",
  "tech",
  "competencias",
  "tecnologias",
  "habilidades",
]);
const LANGUAGES = new Set(["languages", "idiomas"]);
const PROJECTS = new Set(["projects", "proyectos"]);
const CERTIFICATIONS = new Set(["certifications", "certificaciones"]);

function splitRoleCompany(text: string): { role: string; company: string } {
  const m = text.match(/^(.+?)\s+(?:at|@|—|–|-|,)\s+(.+)$/i);
  if (m) return { role: m[1].trim(), company: m[2].trim() };
  return { role: text.trim(), company: "" };
}

function handleBullet(profile: Profile, section: string, text: string): void {
  const n = norm(section);
  if (EXPERIENCE.has(n)) {
    const e = createExperience();
    const { role, company } = splitRoleCompany(text);
    e.role = { es: role };
    e.company = company;
    profile.experiences.push(e);
  } else if (EDUCATION.has(n)) {
    const e = createEducation();
    const { role, company } = splitRoleCompany(text);
    e.degree = { es: role };
    e.institution = company;
    profile.education.push(e);
  } else if (SKILLS.has(n)) {
    const s = createSkill();
    s.name = text.trim();
    profile.skills.push(s);
  } else if (LANGUAGES.has(n)) {
    const l = createLanguage();
    l.name = text.trim();
    profile.languages.push(l);
  } else if (PROJECTS.has(n)) {
    const p = createProject();
    p.name = text.trim();
    profile.projects.push(p);
  } else if (CERTIFICATIONS.has(n)) {
    const c = createCertification();
    c.name = text.trim();
    profile.certifications.push(c);
  }
}

/**
 * Importador best-effort: convierte un currículum en Markdown en un `Profile`
 * aproximado (nombre, resumen y listas por sección). El usuario lo refina luego.
 */
export function parseMarkdown(markdown: string): Profile {
  const profile = createProfile();
  const summaryParts: string[] = [];
  let section: string | null = null;
  let nameSet = false;

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const h1 = line.match(/^#\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const bullet = line.match(/^[-*•]\s+(.+)/);

    if (h1 && !nameSet) {
      const parts = h1[1].trim().split(/\s+/);
      const lastName = parts.pop() ?? "";
      profile.personal.firstName = { es: parts.join(" ") };
      profile.personal.lastName = { es: lastName };
      nameSet = true;
    } else if (h2) {
      section = h2[1].trim();
    } else if (bullet && section) {
      handleBullet(profile, section, bullet[1].trim());
    } else if (!section && nameSet) {
      summaryParts.push(line);
    }
  }

  if (summaryParts.length) {
    profile.summaries[0].text = { es: summaryParts.join("\n") };
  }

  profile.versions[0] = selectAll(profile, profile.versions[0]);
  return profile;
}

export const markdownImporter: Importer = {
  id: "markdown",
  name: "Markdown",
  parse: parseMarkdown,
};
