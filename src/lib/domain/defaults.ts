import {
  SCHEMA_VERSION,
  type Achievement,
  type Certification,
  type CvVersion,
  type Education,
  type Experience,
  type JobOffer,
  type Language,
  type LocalizedList,
  type LocalizedString,
  type PersonalInfo,
  type Profile,
  type ProfileSummary,
  type Project,
  type SectionConfig,
  type SectionId,
  type Skill,
} from "./schema";

export const DEFAULT_TEMPLATE_ID = "modern";

/** Genera un id único (webview + Node). */
export function newId(): string {
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto?.randomUUID) {
    return g.crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const APP_LANGS: string[] = ["es", "en"];

export function emptyLocalizedString(langs: string[] = APP_LANGS): LocalizedString {
  const out: LocalizedString = {};
  for (const lang of langs) out[lang] = "";
  return out;
}

export function emptyLocalizedList(langs: string[] = APP_LANGS): LocalizedList {
  const out: LocalizedList = {};
  for (const lang of langs) out[lang] = [];
  return out;
}

export function createPersonalInfo(): PersonalInfo {
  return {
    firstName: emptyLocalizedString(),
    lastName: emptyLocalizedString(),
    photo: undefined,
    headline: emptyLocalizedString(),
    phone: undefined,
    email: undefined,
    location: emptyLocalizedString(),
    links: [],
  };
}

export function createProfileSummary(): ProfileSummary {
  return { id: newId(), title: emptyLocalizedString(), text: emptyLocalizedString() };
}

export function createExperience(): Experience {
  return {
    id: newId(),
    company: "",
    role: emptyLocalizedString(),
    start: "",
    end: undefined,
    location: emptyLocalizedString(),
    mode: "onsite",
    summary: emptyLocalizedString(),
    description: emptyLocalizedString(),
    responsibilities: emptyLocalizedList(),
    skillIds: [],
    projectIds: [],
    achievementIds: [],
  };
}

export function createProject(): Project {
  return {
    id: newId(),
    name: "",
    company: undefined,
    client: undefined,
    start: undefined,
    end: undefined,
    role: emptyLocalizedString(),
    description: emptyLocalizedString(),
    responsibilities: emptyLocalizedList(),
    skillIds: [],
    achievementIds: [],
    url: undefined,
    repo: undefined,
    images: [],
    extra: emptyLocalizedString(),
    hidden: false,
  };
}

export function createEducation(): Education {
  return {
    id: newId(),
    degree: emptyLocalizedString(),
    institution: "",
    start: undefined,
    end: undefined,
    location: emptyLocalizedString(),
    description: emptyLocalizedString(),
    level: "",
  };
}

export function createSkill(): Skill {
  return {
    id: newId(),
    name: "",
    category: "",
    level: "intermediate",
    years: undefined,
    lastUsed: undefined,
    description: emptyLocalizedString(),
  };
}

export function createLanguage(): Language {
  return {
    id: newId(),
    name: "",
    level: "",
    certification: undefined,
    description: emptyLocalizedString(),
  };
}

export function createCertification(): Certification {
  return {
    id: newId(),
    name: "",
    organization: "",
    issueDate: undefined,
    expiryDate: undefined,
    credentialId: undefined,
    url: undefined,
    document: undefined,
  };
}

export function createAchievement(): Achievement {
  return {
    id: newId(),
    title: emptyLocalizedString(),
    description: emptyLocalizedString(),
    date: undefined,
    projectId: undefined,
    metric: undefined,
  };
}

export function createJobOffer(): JobOffer {
  return {
    id: newId(),
    title: "",
    company: "",
    description: "",
    requirements: [],
    techs: [],
    url: undefined,
  };
}

const SECTION_ORDER: SectionId[] = [
  "summary",
  "experience",
  "projects",
  "education",
  "skills",
  "languages",
  "certifications",
  "achievements",
];

const SECTION_TITLES: Record<SectionId, [string, string]> = {
  summary: ["Perfil", "Profile"],
  experience: ["Experiencia", "Experience"],
  projects: ["Proyectos", "Projects"],
  education: ["Formación", "Education"],
  skills: ["Tecnologías", "Skills"],
  languages: ["Idiomas", "Languages"],
  certifications: ["Certificaciones", "Certifications"],
  achievements: ["Logros", "Achievements"],
};

export function defaultSections(): SectionConfig[] {
  return SECTION_ORDER.map((id, order) => {
    const [es, en] = SECTION_TITLES[id];
    return { id, title: { es, en }, order, visible: true };
  });
}

export function createCvVersion(templateId: string = DEFAULT_TEMPLATE_ID): CvVersion {
  return {
    id: newId(),
    name: "CV Principal",
    lang: "es",
    targetRole: emptyLocalizedString(),
    templateId,
    summaryId: undefined,
    personal: { photo: true, phone: true, email: true, location: true, links: true },
    sections: defaultSections(),
    selection: {
      experienceIds: [],
      projectIds: [],
      educationIds: [],
      skillIds: [],
      languageIds: [],
      certificationIds: [],
      achievementIds: [],
    },
    featured: { skillIds: [], experienceIds: [], projectIds: [] },
    overrides: {},
  };
}

function localized(text: string): LocalizedString {
  return { es: text, en: text };
}

function seededExperience(
  company: string,
  role: string,
  start: string,
  end: string | undefined,
  location: string,
  mode: Experience["mode"],
): Experience {
  const experience = createExperience();
  experience.company = company;
  experience.role = localized(role);
  experience.start = start;
  experience.end = end;
  experience.location = localized(location);
  experience.mode = mode;
  return experience;
}

function seededProject(
  name: string,
  role: string,
  company: string,
  start: string,
  end: string | undefined,
  description: string,
): Project {
  const project = createProject();
  project.name = name;
  project.role = localized(role);
  project.company = company;
  project.start = start;
  project.end = end;
  project.description = localized(description);
  return project;
}

function seededEducation(
  degree: string,
  institution: string,
  start: string,
  end: string,
  location: string,
): Education {
  const education = createEducation();
  education.degree = localized(degree);
  education.institution = institution;
  education.start = start;
  education.end = end;
  education.location = localized(location);
  education.level = degree.startsWith("Grado Medio") ? "Grado Medio" : "Grado Superior";
  return education;
}

function seededSkill(name: string, category: string): Skill {
  const skill = createSkill();
  skill.name = name;
  skill.category = category;
  return skill;
}

function seededAchievement(title: string, description: string, metric?: string): Achievement {
  const achievement = createAchievement();
  achievement.title = localized(title);
  achievement.description = localized(description);
  achievement.metric = metric;
  return achievement;
}

/** Perfil inicial cargado desde CV_Elena_Raibal_2026_ES.pdf. */


export function createProfile(): Profile {
  return {
    schemaVersion: SCHEMA_VERSION,
    personal: createPersonalInfo(),
    summaries: [createProfileSummary()],
    experiences: [],
    projects: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    achievements: [],
    offers: [],
    versions: [createCvVersion()],
  };
}
