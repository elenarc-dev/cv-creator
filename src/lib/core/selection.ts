import type { CvVersion, Profile } from "../domain/schema";

/** Devuelve una copia de la versión con todos los elementos del perfil seleccionados. */
export function selectAll(profile: Profile, version: CvVersion): CvVersion {
  return {
    ...version,
    selection: {
      experienceIds: profile.experiences.map((e) => e.id),
      projectIds: profile.projects.map((p) => p.id),
      educationIds: profile.education.map((e) => e.id),
      skillIds: profile.skills.map((s) => s.id),
      languageIds: profile.languages.map((l) => l.id),
      certificationIds: profile.certifications.map((c) => c.id),
      achievementIds: profile.achievements.map((a) => a.id),
    },
  };
}
