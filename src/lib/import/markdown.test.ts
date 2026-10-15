import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./markdown";

const md = `# Elena Rabadán

Desarrolladora senior con 10 años de experiencia.

## Experiencia

- Ingeniera at Acme
- Tech Lead — Globex

## Tecnologías

- Java
- TypeScript

## Idiomas

- Español
`;

describe("importador Markdown", () => {
  it("extrae nombre, resumen y secciones", () => {
    const profile = parseMarkdown(md);
    expect(profile.personal.firstName.es).toBe("Elena");
    expect(profile.personal.lastName.es).toBe("Rabadán");
    expect(profile.experiences).toHaveLength(2);
    expect(profile.experiences[0].company).toBe("Acme");
    expect(profile.experiences[1].company).toBe("Globex");
    expect(profile.skills.map((s) => s.name)).toEqual(["Java", "TypeScript"]);
    expect(profile.languages.map((l) => l.name)).toEqual(["Español"]);
    expect(profile.summaries[0].text.es).toContain("10 años");
  });

  it("selecciona todos los elementos en la primera versión", () => {
    const profile = parseMarkdown(md);
    const sel = profile.versions[0].selection;
    expect(sel.experienceIds).toHaveLength(2);
    expect(sel.skillIds).toHaveLength(2);
    expect(sel.languageIds).toHaveLength(1);
  });
});
