import { describe, expect, it } from "vitest";
import { resolveCv } from "../core/resolver";
import { createElenaProfile } from "../domain/defaults";
import { toCandidateProfileDraft } from "./draft";

 describe("candidate profile draft", () => {
  it("proyecta el CV activo sin credenciales ni acciones externas", () => {
    const profile = createElenaProfile();
    const document = resolveCv(profile, profile.versions[0]);
    const draft = toCandidateProfileDraft(document);

    expect(draft.fullName).toBe("Elena Raibal Campillo");
    expect(draft.headline).toBe("Ingeniera de Software");
    expect(draft.experiences).toHaveLength(3);
    expect(draft.projects).toHaveLength(7);
    expect(draft.education).toHaveLength(3);
    expect(draft.skills).toHaveLength(33);
    expect(draft.languages).toHaveLength(3);
    expect(draft.links.map((link) => link.type)).toEqual(["linkedin", "github"]);
  });
});
