import type { CvDocument } from "../core/resolver";
import { renderDocument } from "../render/render";
import type { Template, TemplateOptions } from "../templates/types";
import { openDirectoryDialog, saveTextFileDialog, writeTextFile } from "../tauri/io";

function sanitizeFilename(s: string): string {
  return (
    s
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "cv"
  );
}

/** Exporta un único HTML autocontenido (CSS inline). Devuelve la ruta o null. */
export async function exportHtmlStandalone(
  bodyHtml: string,
  doc: CvDocument,
  template: Template,
  options?: Partial<TemplateOptions>,
): Promise<string | null> {
  const { standalone } = renderDocument(bodyHtml, doc, template, options);
  return saveTextFileDialog(standalone, {
    defaultName: `${sanitizeFilename(doc.title)}.html`,
    filters: [{ name: "HTML", extensions: ["html"] }],
  });
}

/** Exporta como paquete (index.html + css/style.css). Devuelve el directorio o null. */
export async function exportHtmlPackage(
  bodyHtml: string,
  doc: CvDocument,
  template: Template,
  options?: Partial<TemplateOptions>,
): Promise<string | null> {
  const { indexHtml, styleCss } = renderDocument(bodyHtml, doc, template, options);
  const dir = await openDirectoryDialog();
  if (!dir) return null;
  await writeTextFile(`${dir}/index.html`, indexHtml);
  await writeTextFile(`${dir}/css/style.css`, styleCss);
  return dir;
}
