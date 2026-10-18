import type {
  Achievement,
  Certification,
  CvVersion,
  Education,
  Experience,
  Language,
  Lang,
  LinkType,
  Profile,
  Project,
  SectionConfig,
  SectionId,
  Skill,
  SkillLevel,
  WorkMode,
} from "../domain/schema";
import { localize, localizeList } from "./localize";

// ---------- etiquetas localizadas (enums → texto) ----------

export interface CvLabels {
  present: string;
  years: string;
  workMode: Record<WorkMode, string>;
  skillLevel: Record<SkillLevel, string>;
  linkTypes: Record<LinkType, string>;
}

const LABELS: Record<string, CvLabels> = {
  es: {
    present: "Actualidad",
    years: "años",
    workMode: { remote: "Remoto", hybrid: "Híbrido", onsite: "Presencial" },
    skillLevel: {
      basic: "Básico",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      expert: "Experto",
    },
    linkTypes: {
      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portfolio",
      website: "Web",
      other: "Enlace",
    },
  },
  en: {
    present: "Present",
    years: "years",
    workMode: { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" },
    skillLevel: {
      basic: "Basic",
      intermediate: "Intermediate",
      advanced: "Advanced",
      expert: "Expert",
    },
    linkTypes: {
      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portfolio",
      website: "Website",
      other: "Link",
    },
  },
};

function labelsFor(lang: Lang): CvLabels {
  return LABELS[lang] ?? LABELS.en;
}

// ---------- view model resuelto (listo para renderizar) ----------

export interface ResolvedLink {
  type: LinkType;
  url: string;
  label?: string;
}

export interface ResolvedPersonal {
  firstName: string;
  lastName: string;
  photo?: string;
  headline: string;
  phone?: string;
  email?: string;
  location?: string;
  links: ResolvedLink[];
}

export interface ResolvedSkillRef {
  id: string;
  name: string;
}

export interface ResolvedAchievementRef {
  id: string;
  title: string;
  metric?: string;
}

export interface ResolvedSkill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  years?: number;
  lastUsed?: string;
  description: string;
  featured: boolean;
}

export interface ResolvedExperience {
  id: string;
  company: string;
  role: string;
  start: string;
  end?: string;
  location?: string;
  mode?: WorkMode;
  summary: string;
  description: string;
  responsibilities: string[];
  skills: ResolvedSkillRef[];
  projects: ResolvedSkillRef[];
  achievements: ResolvedAchievementRef[];
  featured: boolean;
}

export interface ResolvedProject {
  id: string;
  name: string;
  company?: string;
  client?: string;
  start?: string;
  end?: string;
  role: string;
  description: string;
  responsibilities: string[];
  skills: ResolvedSkillRef[];
  achievements: ResolvedAchievementRef[];
  url?: string;
  repo?: string;
  images: string[];
  featured: boolean;
  hidden: boolean;
}

export interface ResolvedEducation {
  id: string;
  degree: string;
  institution: string;
  start?: string;
  end?: string;
  location?: string;
  description: string;
  level: string;
}

export interface ResolvedLanguage {
  id: string;
  name: string;
  level: string;
  certification?: string;
  description: string;
}

export interface ResolvedCertification {
  id: string;
  name: string;
  organization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  image?: string;
}

export interface ResolvedAchievement {
  id: string;
  title: string;
  description: string;
  date?: string;
  metric?: string;
}

export type ResolvedItem =
  | { kind: "summary"; text: string }
  | { kind: "experience"; value: ResolvedExperience }
  | { kind: "project"; value: ResolvedProject }
  | { kind: "education"; value: ResolvedEducation }
  | { kind: "skill"; value: ResolvedSkill }
  | { kind: "language"; value: ResolvedLanguage }
  | { kind: "certification"; value: ResolvedCertification }
  | { kind: "achievement"; value: ResolvedAchievement };

export interface ResolvedSection {
  id: SectionId;
  title: string;
  items: ResolvedItem[];
}

export interface CvDocument {
  title: string;
  lang: Lang;
  personal: ResolvedPersonal;
  sections: ResolvedSection[];
  labels: CvLabels;
}

// ---------- helpers ----------

function refs<T extends { id: string }>(
  ids: string[],
  items: T[],
): T[] {
  return ids
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is T => Boolean(i));
}

function resolveSkills(ids: string[], profile: Profile): ResolvedSkillRef[] {
  return refs(ids, profile.skills).map((s) => ({ id: s.id, name: s.name }));
}

function resolveAchievements(
  ids: string[],
  profile: Profile,
  lang: Lang,
): ResolvedAchievementRef[] {
  return refs(ids, profile.achievements).map((a) => ({
    id: a.id,
    title: localize(a.title, lang),
    metric: a.metric,
  }));
}

function inSet(id: string, set: string[]): boolean {
  return set.includes(id);
}

// ---------- resolvers por entidad ----------

function resolvePersonal(
  profile: Profile,
  version: CvVersion,
  lang: Lang,
): ResolvedPersonal {
  const p = profile.personal;
  const v = version.personal;
  return {
    firstName: localize(p.firstName, lang),
    lastName: localize(p.lastName, lang),
    photo: v.photo ? p.photo : undefined,
    headline: localize(p.headline, lang),
    phone: v.phone ? p.phone : undefined,
    email: v.email ? p.email : undefined,
    location: v.location ? localize(p.location, lang) : undefined,
    links: v.links
      ? p.links.map((l) => ({ type: l.type, url: l.url, label: l.label }))
      : [],
  };
}

function resolveSummary(
  profile: Profile,
  version: CvVersion,
  lang: Lang,
): { text: string } | null {
  const summaryId = version.summaryId ?? profile.summaries[0]?.id;
  if (!summaryId) return null;
  const summary = profile.summaries.find((s) => s.id === summaryId);
  const override = version.overrides[summaryId];
  const text = override?.text
    ? localize(override.text, lang)
    : summary
      ? localize(summary.text, lang)
      : "";
  return text ? { text } : null;
}

function resolveExperience(
  e: Experience,
  profile: Profile,
  version: CvVersion,
  lang: Lang,
): ResolvedExperience {
  return {
    id: e.id,
    company: e.company,
    role: localize(e.role, lang),
    start: e.start,
    end: e.end,
    location: e.location ? localize(e.location, lang) : undefined,
    mode: e.mode,
    summary: localize(e.summary, lang),
    description: localize(e.description, lang),
    responsibilities: localizeList(e.responsibilities, lang),
    skills: resolveSkills(e.skillIds, profile),
    projects: refs(e.projectIds, profile.projects).map((p) => ({
      id: p.id,
      name: p.name,
    })),
    achievements: resolveAchievements(e.achievementIds, profile, lang),
    featured: inSet(e.id, version.featured.experienceIds),
  };
}

function resolveProject(
  p: Project,
  profile: Profile,
  version: CvVersion,
  lang: Lang,
): ResolvedProject {
  return {
    id: p.id,
    name: p.name,
    company: p.company,
    client: p.client,
    start: p.start,
    end: p.end,
    role: localize(p.role, lang),
    description: localize(p.description, lang),
    responsibilities: localizeList(p.responsibilities, lang),
    skills: resolveSkills(p.skillIds, profile),
    achievements: resolveAchievements(p.achievementIds, profile, lang),
    url: p.url,
    repo: p.repo,
    images: p.images,
    featured: inSet(p.id, version.featured.projectIds),
    hidden: p.hidden
  };
}

function resolveEducation(e: Education, lang: Lang): ResolvedEducation {
  return {
    id: e.id,
    degree: localize(e.degree, lang),
    institution: e.institution,
    start: e.start,
    end: e.end,
    location: e.location ? localize(e.location, lang) : undefined,
    description: localize(e.description, lang),
    level: e.level,
  };
}

function resolveSkill(s: Skill, version: CvVersion, lang: Lang): ResolvedSkill {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    level: s.level,
    years: s.years,
    lastUsed: s.lastUsed,
    description: localize(s.description, lang),
    featured: inSet(s.id, version.featured.skillIds),
  };
}

function resolveLanguage(l: Language, lang: Lang): ResolvedLanguage {
  return {
    id: l.id,
    name: l.name,
    level: l.level,
    certification: l.certification,
    description: localize(l.description, lang),
  };
}

function resolveCertification(c: Certification): ResolvedCertification {
  return {
    id: c.id,
    name: c.name,
    organization: c.organization,
    issueDate: c.issueDate,
    expiryDate: c.expiryDate,
    credentialId: c.credentialId,
    url: c.url,
    image: c.image,
  };
}

function resolveAchievement(a: Achievement, lang: Lang): ResolvedAchievement {
  return {
    id: a.id,
    title: localize(a.title, lang),
    description: localize(a.description, lang),
    date: a.date,
    metric: a.metric,
  };
}

// ---------- sección ----------

function resolveSection(
  section: SectionConfig,
  profile: Profile,
  version: CvVersion,
  lang: Lang,
  summary: { text: string } | null,
): ResolvedSection {
  const title = localize(section.title, lang) || section.id;
  const sel = version.selection;

  switch (section.id) {
    case "summary": {
      const items: ResolvedItem[] = summary ? [{ kind: "summary", text: summary.text }] : [];
      return { id: section.id, title, items };
    }
    case "experience": {
      const items: ResolvedItem[] = refs(sel.experienceIds, profile.experiences).map((e) => ({
        kind: "experience",
        value: resolveExperience(e, profile, version, lang),
      }));
      return { id: section.id, title, items };
    }
    case "projects": {
      const items: ResolvedItem[] = refs(sel.projectIds, profile.projects).map((p) => ({
        kind: "project",
        value: resolveProject(p, profile, version, lang),
      }));
      return { id: section.id, title, items };
    }
    case "education": {
      const items: ResolvedItem[] = refs(sel.educationIds, profile.education).map((e) => ({
        kind: "education",
        value: resolveEducation(e, lang),
      }));
      return { id: section.id, title, items };
    }
    case "skills": {
      const items: ResolvedItem[] = refs(sel.skillIds, profile.skills).map((s) => ({
        kind: "skill",
        value: resolveSkill(s, version, lang),
      }));
      return { id: section.id, title, items };
    }
    case "languages": {
      const items: ResolvedItem[] = refs(sel.languageIds, profile.languages).map((l) => ({
        kind: "language",
        value: resolveLanguage(l, lang),
      }));
      return { id: section.id, title, items };
    }
    case "certifications": {
      const items: ResolvedItem[] = refs(sel.certificationIds, profile.certifications).map(
        (c) => ({ kind: "certification", value: resolveCertification(c) }),
      );
      return { id: section.id, title, items };
    }
    case "achievements": {
      const items: ResolvedItem[] = refs(sel.achievementIds, profile.achievements).map(
        (a) => ({ kind: "achievement", value: resolveAchievement(a, lang) }),
      );
      return { id: section.id, title, items };
    }
  }
}

// ---------- principal ----------

/**
 * Resuelve un perfil + versión a un view model localizado, filtrado y ordenado,
 * listo para que una plantilla lo renderice. Función pura.
 */
export function resolveCv(profile: Profile, version: CvVersion): CvDocument {
  const lang = version.lang;
  const personal = resolvePersonal(profile, version, lang);
  const summary = resolveSummary(profile, version, lang);

  const sections = version.sections
    .filter((s) => s.visible)
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s) => resolveSection(s, profile, version, lang, summary))
    .filter((s) => s.items.length > 0);

  const name = [personal.firstName, personal.lastName].filter(Boolean).join(" ");
  const title =
    localize(version.targetRole, lang) || personal.headline || name || "CV";

  return { title, lang, personal, sections, labels: labelsFor(lang) };
}
