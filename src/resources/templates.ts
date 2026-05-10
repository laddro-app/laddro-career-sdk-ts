import type { HttpClient } from "../http.js";
import type { Language, ModelProvider, Template, TemplateDetail, TemplateFont } from "../types.js";

export class Templates {
  constructor(private http: HttpClient) {}

  async list(): Promise<Template[]> {
    const res = await this.http.request<{ templates: Template[] }>({
      method: "GET",
      path: "/v1/templates",
    });
    return res.templates;
  }

  async get(templateId: string): Promise<TemplateDetail> {
    return this.http.request<TemplateDetail>({
      method: "GET",
      path: `/v1/templates/${templateId}`,
    });
  }

  async fonts(): Promise<TemplateFont[]> {
    const res = await this.http.request<{ fonts: TemplateFont[] }>({
      method: "GET",
      path: "/v1/fonts",
    });
    return res.fonts;
  }

  async languages(): Promise<Language[]> {
    const res = await this.http.request<{ languages: Language[] }>({
      method: "GET",
      path: "/v1/languages",
    });
    return res.languages;
  }

  async models(): Promise<ModelProvider[]> {
    const res = await this.http.request<{ models: ModelProvider[] }>({
      method: "GET",
      path: "/v1/models",
    });
    return res.models;
  }
}
