import type { Component } from "svelte";
import ElenaPdfTemplate from "./components/ElenaPdfTemplate.svelte";
import ModernTemplate from "./components/ModernTemplate.svelte";
import SidebarTemplate from "./components/SidebarTemplate.svelte";
import type { TemplateComponentProps } from "./types";

const components: Record<string, Component<TemplateComponentProps>> = {
  modern: ModernTemplate,
  sidebar: SidebarTemplate,
  "elena-pdf": ElenaPdfTemplate,
};

export function getTemplateComponent(id: string): Component<TemplateComponentProps> | undefined {
  return components[id];
}
