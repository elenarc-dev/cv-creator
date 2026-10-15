import { describe, expect, it } from "vitest";
import { createProfile } from "../domain/defaults";
import { profileToJson } from "../export/json";
import { parseProfile } from "./json";

describe("JSON import/export", () => {
  it("exporta e importa sin pérdida (round-trip)", () => {
    const profile = createProfile();
    profile.personal.firstName = { es: "Elena", en: "Elena" };
    profile.personal.lastName = { es: "Rabadán" };
    profile.personal.email = "elena@example.com";

    const json = profileToJson(profile);
    const parsed = parseProfile(json);
    expect(parsed).toEqual(profile);
  });

  it("rechaza JSON malformado", () => {
    expect(() => parseProfile("{ no es json")).toThrow(/JSON válido/);
  });

  it("rechaza estructura que no cumple el esquema", () => {
    expect(() => parseProfile('{"foo": 1}')).toThrow(/no válida/);
  });
});
