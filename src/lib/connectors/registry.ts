import { toCandidateProfileDraft } from "./draft";
import type { PlatformConnector } from "./types";

const connectors: PlatformConnector[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    availability: "unavailable",
    mode: "manual",
    capabilities: ["resume-upload", "profile-update"],
    reason: "Sin API pública oficial para sincronizar un perfil de candidato; usar exportación manual.",
    buildDraft: toCandidateProfileDraft,
  },
  {
    id: "indeed",
    name: "Indeed",
    availability: "unavailable",
    mode: "manual",
    capabilities: ["resume-upload", "profile-update"],
    reason:
      "Los términos de Indeed prohíben automatizar Indeed Apply con scripts, bots o automatización fuera de sus proveedores y herramientas oficiales. Se mantiene como flujo manual.",
    sources: [
      { label: "Indeed · Terms of Service", url: "https://www.indeed.com/legal" },
      { label: "Indeed · robots.txt", url: "https://www.indeed.com/robots.txt" },
    ],
    buildDraft: toCandidateProfileDraft,
  },
  {
    id: "tecnoempleo",
    name: "Tecnoempleo",
    availability: "unavailable",
    mode: "manual",
    capabilities: ["resume-upload", "profile-update"],
    reason:
      "La web ofrece gestión manual del perfil y del CV, e integraciones orientadas a empresas/ATS, pero no se ha localizado una API pública para sincronizar un perfil de candidato.",
    sources: [
      { label: "Tecnoempleo · portal", url: "https://www.tecnoempleo.com/" },
      { label: "Tecnoempleo · privacidad", url: "https://www.tecnoempleo.com/politica.php" },
      { label: "Tecnoempleo · robots.txt", url: "https://www.tecnoempleo.com/robots.txt" },
    ],
    buildDraft: toCandidateProfileDraft,
  },
];

export function listConnectors(): PlatformConnector[] {
  return connectors;
}

export function getConnector(id: string): PlatformConnector | undefined {
  return connectors.find((c) => c.id === id);
}

export function registerConnector(connector: PlatformConnector): void {
  if (!connectors.some((c) => c.id === connector.id)) {
    connectors.push(connector);
  }
}
