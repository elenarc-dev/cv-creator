import { describe, expect, it } from "vitest";
import { createCvVersion, createElenaProfile, createProfile, newId } from "./defaults";
import { CvVersion, Profile, SCHEMA_VERSION } from "./schema";

describe("dominio: defaults y esquema", () => {
  it("crea un perfil válido según el esquema", () => {
    const profile = createProfile();
    expect(profile.schemaVersion).toBe(SCHEMA_VERSION);
    const parsed = Profile.safeParse(profile);
    expect(parsed.success).toBe(true);
  });

  it("crea una versión de CV válida según el esquema", () => {
    const version = createCvVersion();
    expect(CvVersion.safeParse(version).success).toBe(true);
  });

  it("carga el perfil de Elena desde el CV", () => {
    const profile = createElenaProfile();
    expect(Profile.safeParse(profile).success).toBe(true);
    expect(profile.personal.firstName.es).toBe("Elena");
    expect(profile.experiences).toHaveLength(3);
    expect(profile.projects).toHaveLength(7);
    expect(profile.skills.length).toBeGreaterThan(30);
    expect(profile.languages).toHaveLength(3);
    expect(profile.achievements).toHaveLength(3);
  });

  it("genera ids únicos", () => {
    expect(newId()).not.toBe(newId());
  });
});
