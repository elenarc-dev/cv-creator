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

  it("migra el campo `document` de certificaciones a `image`", () => {
    // `document` es el nombre antiguo del campo: ya no existe en el tipo actual.
    const legacy = {
      ...createProfile(),
      certifications: [
        {
          id: "c1",
          name: "AWS SAA",
          organization: "Amazon",
          issueDate: "2024-01",
          credentialId: "ABC-123",
          document: "data:image/png;base64,AAAA",
        },
      ],
    };

    const parsed = parseProfile(JSON.stringify(legacy));

    expect(parsed.certifications[0].image).toBe("data:image/png;base64,AAAA");
    expect(parsed.certifications[0]).not.toHaveProperty("document");
  });
});
