import { describe, expect, it } from "vitest";
import { resolveCv } from "../core/resolver";
import { createElenaProfile, createExperience, createProfile } from "../domain/defaults";
import { getTemplate } from "../templates/registry";
import { renderDocument } from "./render";

describe("render", () => {
  it("genera HTML standalone completo", () => {
    const profile = createProfile();
    profile.personal.firstName = { es: "Elena" };
    profile.personal.lastName = { es: "Rabadán" };
    profile.personal.headline = { es: "Desarrolladora" };
    profile.personal.email = "elena@example.com";

    const exp = createExperience();
    exp.company = "Acme";
    exp.role = { es: "Ingeniera" };
    exp.start = "2020-01";
    exp.description = { es: "Descripción" };
    profile.experiences = [exp];

    const version = profile.versions[0];
    version.selection.experienceIds = [exp.id];

    const doc = resolveCv(profile, version);
    const html = renderDocument(
      '<div class="cv-document"><p>Elena Rabadán</p><p>Acme</p><h2>Experiencia</h2></div>',
      doc,
      getTemplate("modern")!,
    ).standalone;

    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("Elena Rabadán");
    expect(html).toContain("Acme");
    expect(html).toContain("Experiencia");
    expect(html).toContain("<style>");
  });

  it("escapa contenido HTML malicioso", () => {
    const profile = createProfile();
    const exp = createExperience();
    exp.company = "&lt;script&gt;alert(1)&lt;/script&gt;";
    exp.role = { es: "X" };
    profile.experiences = [exp];

    const version = profile.versions[0];
    version.selection.experienceIds = [exp.id];

    const doc = resolveCv(profile, version);
    const html = renderDocument(
      '<div class="cv-document">&lt;script&gt;alert(1)&lt;/script&gt;</div>',
      doc,
      getTemplate("modern")!,
    ).standalone;

    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renderiza la plantilla inspirada en el PDF de Elena", () => {
    const profile = createElenaProfile();
    const doc = resolveCv(profile, profile.versions[0]);
    const html = renderDocument(
      '<div class="cv-document"><div class="pdf-layout">Liderazgo de Equipos</div></div>',
      doc,
      getTemplate("elena-pdf")!,
    ).standalone;

    expect(html).toContain("pdf-layout");
    expect(html).toContain("Liderazgo de Equipos");
    expect(html).toContain("<style>");
  });

  it("genera el modo paquete con CSS externo", () => {
    const profile = createProfile();
    const doc = resolveCv(profile, profile.versions[0]);
    const result = renderDocument('<div class="cv-document"></div>', doc, getTemplate("modern")!);

    expect(result.indexHtml).toContain('href="css/style.css"');
    expect(result.indexHtml).not.toContain("<style>");
    expect(result.styleCss).toContain("html, body");
  });
});
