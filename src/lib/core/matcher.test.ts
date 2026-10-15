import { describe, expect, it } from "vitest";
import {
  createExperience,
  createJobOffer,
  createProfile,
  createProject,
  createSkill,
} from "../domain/defaults";
import { matchOffer } from "./matcher";

function sample() {
  const profile = createProfile();

  const java = createSkill();
  java.name = "Java";
  const react = createSkill();
  react.name = "React";
  const ts = createSkill();
  ts.name = "TypeScript";
  profile.skills = [java, react, ts];

  const exp = createExperience();
  exp.company = "Acme";
  exp.skillIds = [java.id];
  profile.experiences = [exp];

  const project = createProject();
  project.name = "Portal";
  project.skillIds = [react.id];
  profile.projects = [project];

  return { profile, java, react };
}

describe("matcher", () => {
  it("encuentra tecnologías coincidentes y faltantes", () => {
    const { profile, java, react } = sample();
    const offer = createJobOffer();
    offer.techs = ["Java", "Python"];
    offer.description = "Buscamos perfil con React y experiencia frontend";

    const match = matchOffer(profile, offer);

    expect(match.matchedSkillIds).toContain(java.id);
    expect(match.matchedSkillIds).toContain(react.id);
    expect(match.missingTechs).toEqual(["Python"]);
  });

  it("selecciona experiencias y proyectos relevantes", () => {
    const { profile } = sample();
    const offer = createJobOffer();
    offer.techs = ["Java", "React"];

    const match = matchOffer(profile, offer);
    expect(match.relevantExperienceIds).toHaveLength(1);
    expect(match.relevantProjectIds).toHaveLength(1);
  });

  it("calcula el score como coincidencias menos faltantes", () => {
    const { profile } = sample();
    const offer = createJobOffer();
    offer.techs = ["Java", "Python"];
    offer.description = "React";

    const match = matchOffer(profile, offer);
    // coinciden Java y React (2), falta Python (1)
    expect(match.score).toBe(1);
  });
});
