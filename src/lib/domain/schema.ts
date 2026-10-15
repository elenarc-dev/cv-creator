import { z } from "zod";

/**
 * Fuente de verdad del modelo de datos.
 *
 * El contenido es independiente de la presentación: las entidades se relacionan
 * por `id` y las versiones de CV referencian (no duplican) los datos.
 *
 * Los textos multilingües se representan con `LocalizedString`/`LocalizedList`,
 * donde la clave es un código de idioma (p.ej. "es", "en") y es extensible.
 */

// ---------- primitivas ----------

export const Lang = z.string();
export type Lang = z.infer<typeof Lang>;

/** Texto por idioma: { es: "...", en: "..." } */
export const LocalizedString = z.record(z.string(), z.string());
export type LocalizedString = z.infer<typeof LocalizedString>;

/** Lista de textos por idioma: { es: ["..."], en: ["..."] } */
export const LocalizedList = z.record(z.string(), z.array(z.string()));
export type LocalizedList = z.infer<typeof LocalizedList>;

/** Fecha de CV con año obligatorio y mes opcional: "YYYY" o "YYYY-MM". */
export const DateString = z.string().refine(
  (value) => value === "" || /^(\d{4}|\d{4}-(0[1-9]|1[0-2]))$/.test(value),
  "La fecha debe tener el formato AAAA o AAAA-MM.",
);
export type DateString = z.infer<typeof DateString>;

// ---------- enlaces ----------

export const LinkType = z.enum([
  "linkedin",
  "github",
  "portfolio",
  "website",
  "other",
]);
export type LinkType = z.infer<typeof LinkType>;

export const Link = z.object({
  id: z.string(),
  type: LinkType,
  url: z.string(),
  label: z.string().optional(),
});
export type Link = z.infer<typeof Link>;

// ---------- información personal ----------

export const PersonalInfo = z.object({
  firstName: LocalizedString,
  lastName: LocalizedString,
  /** data URI o ruta de asset */
  photo: z.string().optional(),
  /** puesto profesional */
  headline: LocalizedString,
  phone: z.string().optional(),
  email: z.string().optional(),
  location: LocalizedString,
  links: z.array(Link),
});
export type PersonalInfo = z.infer<typeof PersonalInfo>;

// ---------- perfil profesional (resúmenes) ----------

export const ProfileSummary = z.object({
  id: z.string(),
  /** p.ej. "Senior Full Stack Developer" */
  title: LocalizedString,
  text: LocalizedString,
});
export type ProfileSummary = z.infer<typeof ProfileSummary>;

// ---------- experiencia ----------

export const WorkMode = z.enum(["remote", "hybrid", "onsite"]);
export type WorkMode = z.infer<typeof WorkMode>;

export const Experience = z.object({
  id: z.string(),
  company: z.string(),
  role: LocalizedString,
  start: DateString,
  end: DateString.optional(),
  location: LocalizedString,
  mode: WorkMode,
  summary: LocalizedString,
  description: LocalizedString,
  responsibilities: LocalizedList,
  skillIds: z.array(z.string()),
  projectIds: z.array(z.string()),
  achievementIds: z.array(z.string()),
});
export type Experience = z.infer<typeof Experience>;

// ---------- proyectos ----------

export const Project = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string().optional(),
  client: z.string().optional(),
  start: DateString.optional(),
  end: DateString.optional(),
  role: LocalizedString,
  description: LocalizedString,
  responsibilities: LocalizedList,
  skillIds: z.array(z.string()),
  achievementIds: z.array(z.string()),
  url: z.string().optional(),
  repo: z.string().optional(),
  images: z.array(z.string()),
  extra: LocalizedString.optional(),
  hidden: z.boolean().default(false)
});
export type Project = z.infer<typeof Project>;

// ---------- formación ----------

export const Education = z.object({
  id: z.string(),
  degree: LocalizedString,
  institution: z.string(),
  start: DateString.optional(),
  end: DateString.optional(),
  location: LocalizedString,
  description: LocalizedString,
  level: z.string(),
});
export type Education = z.infer<typeof Education>;

// ---------- tecnologías / competencias ----------

export const SkillLevel = z.enum(["basic", "intermediate", "advanced", "expert"]);
export type SkillLevel = z.infer<typeof SkillLevel>;

export const Skill = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  level: SkillLevel,
  years: z.number().optional(),
  lastUsed: DateString.optional(),
  description: LocalizedString,
});
export type Skill = z.infer<typeof Skill>;

// ---------- idiomas ----------

export const Language = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string(),
  certification: z.string().optional(),
  description: LocalizedString,
});
export type Language = z.infer<typeof Language>;

// ---------- certificaciones ----------

export const Certification = z.object({
  id: z.string(),
  name: z.string(),
  organization: z.string(),
  issueDate: DateString.optional(),
  expiryDate: DateString.optional(),
  credentialId: z.string().optional(),
  url: z.string().optional(),
  document: z.string().optional(),
});
export type Certification = z.infer<typeof Certification>;

// ---------- logros ----------

export const Achievement = z.object({
  id: z.string(),
  title: LocalizedString,
  description: LocalizedString,
  date: DateString.optional(),
  projectId: z.string().optional(),
  metric: z.string().optional(),
});
export type Achievement = z.infer<typeof Achievement>;

// ---------- oferta de trabajo ----------

export const JobOffer = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
  techs: z.array(z.string()),
  url: z.string().optional(),
});
export type JobOffer = z.infer<typeof JobOffer>;

// ---------- versión de CV ----------

export const SectionId = z.enum([
  "summary",
  "experience",
  "projects",
  "education",
  "skills",
  "languages",
  "certifications",
  "achievements",
]);
export type SectionId = z.infer<typeof SectionId>;

export const SectionConfig = z.object({
  id: SectionId,
  title: LocalizedString,
  order: z.number(),
  visible: z.boolean(),
});
export type SectionConfig = z.infer<typeof SectionConfig>;

export const Selection = z.object({
  experienceIds: z.array(z.string()),
  projectIds: z.array(z.string()),
  educationIds: z.array(z.string()),
  skillIds: z.array(z.string()),
  languageIds: z.array(z.string()),
  certificationIds: z.array(z.string()),
  achievementIds: z.array(z.string()),
});
export type Selection = z.infer<typeof Selection>;

export const PersonalVisibility = z.object({
  photo: z.boolean(),
  phone: z.boolean(),
  email: z.boolean(),
  location: z.boolean(),
  links: z.boolean(),
});
export type PersonalVisibility = z.infer<typeof PersonalVisibility>;

/** Retoque puntual de un elemento en una versión, sin duplicar el dato base. */
export const ItemOverride = z.object({
  text: LocalizedString.optional(),
  description: LocalizedString.optional(),
});
export type ItemOverride = z.infer<typeof ItemOverride>;

export const CvVersion = z.object({
  id: z.string(),
  name: z.string(),
  lang: Lang,
  targetRole: LocalizedString,
  templateId: z.string(),
  summaryId: z.string().optional(),
  personal: PersonalVisibility,
  sections: z.array(SectionConfig),
  selection: Selection,
  featured: z.object({
    skillIds: z.array(z.string()),
    experienceIds: z.array(z.string()),
    projectIds: z.array(z.string()),
  }),
  overrides: z.record(z.string(), ItemOverride),
});
export type CvVersion = z.infer<typeof CvVersion>;

// ---------- plantilla (configuración; el layout vive en código) ----------

export const TemplateConfig = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  options: z.record(z.string(), z.unknown()),
});
export type TemplateConfig = z.infer<typeof TemplateConfig>;

// ---------- perfil raíz ----------

export const Profile = z.object({
  schemaVersion: z.number(),
  personal: PersonalInfo,
  summaries: z.array(ProfileSummary),
  experiences: z.array(Experience),
  projects: z.array(Project),
  education: z.array(Education),
  skills: z.array(Skill),
  languages: z.array(Language),
  certifications: z.array(Certification),
  achievements: z.array(Achievement),
  offers: z.array(JobOffer),
  versions: z.array(CvVersion),
});
export type Profile = z.infer<typeof Profile>;

export const SCHEMA_VERSION = 1;
