import { describe, expect, it } from "vitest";
import {
  createAchievement,
  createCvVersion,
  createEducation,
  createExperience,
  createProfile,
  createProfileSummary,
  createProject,
  createSkill,
} from "../domain/defaults";
import type { Profile } from "../domain/schema";
import { resolveCv } from "./resolver";

function sampleProfile(): Profile {
  const profile = createProfile();

  profile.personal.firstName = { es: "Elena", en: "Elena" };
  profile.personal.lastName = { es: "Rabadán", en: "Rabdan" };
  profile.personal.headline = { es: "Desarrolladora", en: "Developer" };

  const summaryEs = createProfileSummary();
  summaryEs.title = { es: "Java Developer", en: "Java Developer" };
  summaryEs.text = { es: "Resumen en español", en: "Summary in English" };
  profile.summaries = [summaryEs];

  const skill = createSkill();
  skill.id = "skill-java";
  skill.name = "Java";
  skill.category = "Backend";
  skill.level = "expert";
  profile.skills = [skill];

  const achievement = createAchievement();
  achievement.id = "ach-1";
  achievement.title = { es: "Mejora de rendimiento", en: "Performance boost" };
  achievement.metric = "50%";
  profile.achievements = [achievement];

  const exp = createExperience();
  exp.id = "exp-1";
  exp.company = "Acme";
  exp.role = { es: "Ingeniera", en: "Engineer" };
  exp.start = "2020-01";
  exp.skillIds = ["skill-java"];
  exp.achievementIds = ["ach-1"];
  exp.responsibilities = { es: ["Resp A"], en: ["Resp A (EN)"] };
  profile.experiences = [exp];

  const project = createProject();
  project.id = "proj-1";
  project.name = "Portal";
  project.skillIds = ["skill-java"];
  profile.projects = [project];

  const education = createEducation();
  education.id = "edu-1";
  education.degree = { es: "Grado", en: "Degree" };
  education.institution = "Universidad";
  profile.education = [education];

  return profile;
}

describe("resolver", () => {
  it("localiza el contenido al idioma de la versión", () => {
    const profile = sampleProfile();
    const version = createCvVersion();
    version.lang = "en";
    version.selection.experienceIds = ["exp-1"];
    version.summaryId = profile.summaries[0].id;

    const doc = resolveCv(profile, version);
    expect(doc.personal.headline).toBe("Developer");
    const exp = doc.sections.find((s) => s.id === "experience")!;
    expect(exp.items[0]).toMatchObject({ kind: "experience" });
    if (exp.items[0].kind === "experience") {
      expect(exp.items[0].value.role).toBe("Engineer");
      expect(exp.items[0].value.responsibilities).toEqual(["Resp A (EN)"]);
      expect(exp.items[0].value.achievements[0].title).toBe("Performance boost");
    }
    const summary = doc.sections.find((s) => s.id === "summary");
    expect(summary?.items[0]).toEqual({ kind: "summary", text: "Summary in English" });
  });

  it("filtra solo los elementos seleccionados", () => {
    const profile = sampleProfile();
    profile.experiences.push(createExperience());
    const version = createCvVersion();
    version.selection.experienceIds = ["exp-1"];

    const doc = resolveCv(profile, version);
    const exp = doc.sections.find((s) => s.id === "experience")!;
    expect(exp.items).toHaveLength(1);
  });

  it("excluye secciones invisibles y las ordena", () => {
    const profile = sampleProfile();
    const version = createCvVersion();
    version.selection.educationIds = ["edu-1"];
    version.selection.experienceIds = ["exp-1"];
    version.selection.projectIds = ["proj-1"];
    version.sections = version.sections.map((s) =>
      s.id === "education" ? { ...s, visible: false } : s,
    );

    const doc = resolveCv(profile, version);
    expect(doc.sections.some((s) => s.id === "education")).toBe(false);
    const ids = doc.sections.map((s) => s.id);
    const experienceIdx = ids.indexOf("experience");
    const projectsIdx = ids.indexOf("projects");
    expect(experienceIdx).toBeLessThan(projectsIdx);
  });

  it("resuelve referencias de skills por nombre", () => {
    const profile = sampleProfile();
    const version = createCvVersion();
    version.selection.experienceIds = ["exp-1"];
    version.selection.projectIds = ["proj-1"];

    const doc = resolveCv(profile, version);
    const project = doc.sections.find((s) => s.id === "projects")!;
    if (project.items[0].kind === "project") {
      expect(project.items[0].value.skills[0].name).toBe("Java");
    } else {
      throw new Error("expected project");
    }
  });

  it("marca los elementos destacados", () => {
    const profile = sampleProfile();
    const version = createCvVersion();
    version.selection.skillIds = ["skill-java"];
    version.featured.skillIds = ["skill-java"];

    const doc = resolveCv(profile, version);
    const skills = doc.sections.find((s) => s.id === "skills")!;
    if (skills.items[0].kind === "skill") {
      expect(skills.items[0].value.featured).toBe(true);
    }
  });

  it("usa el override del resumen si existe", () => {
    const profile = sampleProfile();
    const version = createCvVersion();
    version.summaryId = profile.summaries[0].id;
    version.overrides[profile.summaries[0].id] = {
      text: { es: "Resumen personalizado" },
    };

    const doc = resolveCv(profile, version);
    const summary = doc.sections.find((s) => s.id === "summary")!;
    expect(summary.items[0]).toEqual({ kind: "summary", text: "Resumen personalizado" });
  });
});
