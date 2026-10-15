import type { CvDocument } from "../core/resolver";
import { renderDocument } from "../render/render";
import type { Template, TemplateOptions } from "../templates/types";

/** Imprime el mismo documento que se muestra en la vista Svelte. */
export function printCv(
  bodyHtml: string,
  doc: CvDocument,
  template: Template,
  options?: Partial<TemplateOptions>,
): void {
  const { standalone } = renderDocument(bodyHtml, doc, template, options);
  printHtml(standalone);
}

function printHtml(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.addEventListener("afterprint", () => iframe.remove(), { once: true });
    win.print();
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
}
