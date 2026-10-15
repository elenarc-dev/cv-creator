import type { JobOffer, Profile } from "../domain/schema";

export interface OfferMatch {
  matchedSkillIds: string[];
  missingTechs: string[];
  relevantExperienceIds: string[];
  relevantProjectIds: string[];
  /** skills coincidentes − tecnologías faltantes (heurística simple). */
  score: number;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}+#.]+/gu, " ")
    .trim();
}

/**
 * Compara un perfil con una oferta. Heurística sin IA:
 * - una tecnología coincide si su nombre aparece en las tecnologías o en el texto de la oferta;
 * - las tecnologías de la oferta sin correspondencia se marcan como faltantes;
 * - las experiencias/proyectos relevantes son los que usan alguna tecnología coincidente.
 */
export function matchOffer(profile: Profile, offer: JobOffer): OfferMatch {
  const offerText = normalize(
    [offer.title, offer.description, ...offer.requirements, ...offer.techs].join(" "),
  );
  const offerTechs = offer.techs.map(normalize).filter(Boolean);

  const matched = profile.skills.filter((s) => {
    const n = normalize(s.name);
    if (!n) return false;
    return offerTechs.includes(n) || offerText.includes(n);
  });
  const matchedIds = new Set(matched.map((s) => s.id));

  const missingTechs = offer.techs.filter(
    (t) => !profile.skills.some((s) => normalize(s.name) === normalize(t)),
  );

  const relevantExperienceIds = profile.experiences
    .filter((e) => e.skillIds.some((id) => matchedIds.has(id)))
    .map((e) => e.id);

  const relevantProjectIds = profile.projects
    .filter((p) => p.skillIds.some((id) => matchedIds.has(id)))
    .map((p) => p.id);

  return {
    matchedSkillIds: matched.map((s) => s.id),
    missingTechs,
    relevantExperienceIds,
    relevantProjectIds,
    score: matched.length - missingTechs.length,
  };
}
