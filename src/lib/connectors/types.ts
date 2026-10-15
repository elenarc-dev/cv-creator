import type { CvDocument } from "../core/resolver";
import type { CandidateProfileDraft } from "./draft";

export type ConnectorAvailability = "available" | "unavailable";
export type ConnectorMode = "manual" | "official-api";
export type ConnectorCapability = "resume-upload" | "profile-update" | "job-application";

export interface ConnectorSource {
  label: string;
  url: string;
}

/**
 * Conector a una plataforma externa.
 *
 * El conector no recibe credenciales ni abre un navegador por sí mismo. `buildDraft`
 * prepara los datos para una exportación manual o para una futura API oficial.
 */
export interface PlatformConnector {
  id: string;
  name: string;
  availability: ConnectorAvailability;
  mode: ConnectorMode;
  capabilities: ConnectorCapability[];
  /** Motivo, especialmente si no está disponible. */
  reason?: string;
  /** Fuentes que justifican el modo y las capacidades declaradas. */
  sources?: ConnectorSource[];
  /** Proyección del CV activo al modelo común de candidato. */
  buildDraft?: (document: CvDocument) => CandidateProfileDraft;
}

export const NO_SCRAPING_RULE =
  "No se automatiza una plataforma sin una API oficial o mecanismo permitido. " +
  "Si no existe, el conector se muestra como 'No disponible' y se ofrece exportación manual.";
