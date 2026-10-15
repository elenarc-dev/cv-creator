import type { CvDocument, ResolvedItem } from "../core/resolver";

export interface CandidateLinkDraft {
  type: string;
  url: string;
  label: string;
}

export interface CandidateExperienceDraft {
  company: string;
  role: string;
  start?: string;
  end?: string;
  location?: string;
  mode?: string;
  summary?: string;
  description?: string;
}

export interface CandidateProjectDraft {
  name: string;
  role?: string;
  company?: string;
  start?: string;
  end?: string;
  description?: string;
}

export interface CandidateEducationDraft {
  degree: string;
  institution: string;
  start?: string;
  end?: string;
  location?: string;
}

export interface CandidateSkillDraft {
  name: string;
  category?: string;
  level?: string;
}

export interface CandidateLanguageDraft {
  name: string;
  level: string;
}

/**
 * Modelo intermedio que pueden consumir una API oficial o un exportador manual.
 * No contiene credenciales ni ejecuta acciones en plataformas externas.
 */
export interface CandidateProfileDraft {
  fullName: string;
  headline: string;
  email?: string;
  phone?: string;
  location?: string;
  links: CandidateLinkDraft[];
  summary: string;
  experiences: CandidateExperienceDraft[];
  projects: CandidateProjectDraft[];
  education: CandidateEducationDraft[];
  skills: CandidateSkillDraft[];
  languages: CandidateLanguageDraft[];
}

function itemsOf(doc: CvDocument, sectionId: string): ResolvedItem[] {
  return doc.sections.find((section) => section.id === sectionId)?.items ?? [];
}

function dateRange(item: { start?: string; end?: string }): Pick<CandidateExperienceDraft, "start" | "end"> {
  return { start: item.start, end: item.end };
}

export function toCandidateProfileDraft(doc: CvDocument): CandidateProfileDraft {
  const summary = itemsOf(doc, "summary")
    .filter((item): item is Extract<ResolvedItem, { kind: "summary" }> => item.kind === "summary")
    .map((item) => item.text)
    .join("\n\n");

  const experiences = itemsOf(doc, "experience")
    .filter((item): item is Extract<ResolvedItem, { kind: "experience" }> => item.kind === "experience")
    .map((item) => ({
      company: item.value.company,
      role: item.value.role,
      ...dateRange(item.value),
      location: item.value.location,
      mode: item.value.mode ? doc.labels.workMode[item.value.mode] : undefined,
      summary: item.value.summary || undefined,
      description: item.value.description || undefined,
    }));

  const projects = itemsOf(doc, "projects")
    .filter((item): item is Extract<ResolvedItem, { kind: "project" }> => item.kind === "project")
    .map((item) => ({
      name: item.value.name,
      role: item.value.role || undefined,
      company: item.value.company,
      ...dateRange(item.value),
      description: item.value.description || undefined,
    }));

  const education = itemsOf(doc, "education")
    .filter((item): item is Extract<ResolvedItem, { kind: "education" }> => item.kind === "education")
    .map((item) => ({
      degree: item.value.degree,
      institution: item.value.institution,
      ...dateRange(item.value),
      location: item.value.location,
    }));

  const skills = itemsOf(doc, "skills")
    .filter((item): item is Extract<ResolvedItem, { kind: "skill" }> => item.kind === "skill")
    .map((item) => ({
      name: item.value.name,
      category: item.value.category || undefined,
      level: doc.labels.skillLevel[item.value.level],
    }));

  const languages = itemsOf(doc, "languages")
    .filter((item): item is Extract<ResolvedItem, { kind: "language" }> => item.kind === "language")
    .map((item) => ({ name: item.value.name, level: item.value.level }));

  return {
    fullName: [doc.personal.firstName, doc.personal.lastName].filter(Boolean).join(" "),
    headline: doc.personal.headline,
    email: doc.personal.email,
    phone: doc.personal.phone,
    location: doc.personal.location,
    links: doc.personal.links.map((link) => ({
      type: link.type,
      url: link.url,
      label: link.label ?? doc.labels.linkTypes[link.type],
    })),
    summary,
    experiences,
    projects,
    education,
    skills,
    languages,
  };
}
