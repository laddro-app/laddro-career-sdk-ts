import type { HttpClient } from "../http.js";
import type { PaginatedList, PaginationParams, RenderOptions, ResumeSummary, SSEEvent } from "../types.js";

export interface ParseResumeOptions extends Partial<RenderOptions> {
  file: Blob | Buffer;
  filename?: string;
}

export class Resumes {
  constructor(private http: HttpClient) {}

  async list(params?: PaginationParams): Promise<PaginatedList<ResumeSummary>> {
    return this.http.request<PaginatedList<ResumeSummary>>({
      method: "GET",
      path: "/v1/resumes",
      query: {
        limit: params?.limit,
        offset: params?.offset,
      },
    });
  }

  async get(resumeId: string): Promise<ResumeSummary> {
    return this.http.request<ResumeSummary>({
      method: "GET",
      path: `/v1/resumes/${resumeId}`,
    });
  }

  async parse(options: ParseResumeOptions): Promise<ArrayBuffer> {
    const form = new FormData();
    const blob = options.file instanceof Blob
      ? options.file
      : new Blob([options.file]);
    form.append("file", blob, options.filename || "resume.pdf");

    if (options.templateId) form.append("templateId", options.templateId);
    if (options.locale) form.append("locale", options.locale);
    if (options.colorId) form.append("colorId", options.colorId);
    if (options.font) form.append("font", options.font);
    if (options.spacing !== undefined) form.append("spacing", String(options.spacing));
    if (options.margin !== undefined) form.append("margin", String(options.margin));
    if (options.fontSize !== undefined) form.append("fontSize", String(options.fontSize));
    if (options.showProfileImage !== undefined) form.append("showProfileImage", String(options.showProfileImage));
    if (options.profileImageUrl) form.append("profileImageUrl", options.profileImageUrl);
    if (options.pageNumbering) form.append("pageNumbering", options.pageNumbering);

    return this.http.requestBinary({
      method: "POST",
      path: "/v1/resumes/parse",
      body: form,
    });
  }

  async render(resumeId: string, options: RenderOptions): Promise<ArrayBuffer> {
    return this.http.requestBinary({
      method: "PUT",
      path: `/v1/resumes/${resumeId}/render`,
      body: options,
    });
  }

  async *parseStream(options: ParseResumeOptions): AsyncGenerator<SSEEvent> {
    const form = new FormData();
    const blob = options.file instanceof Blob
      ? options.file
      : new Blob([options.file]);
    form.append("file", blob, options.filename || "resume.pdf");

    if (options.templateId) form.append("templateId", options.templateId);
    if (options.locale) form.append("locale", options.locale);
    if (options.colorId) form.append("colorId", options.colorId);
    if (options.font) form.append("font", options.font);
    if (options.spacing !== undefined) form.append("spacing", String(options.spacing));
    if (options.margin !== undefined) form.append("margin", String(options.margin));
    if (options.fontSize !== undefined) form.append("fontSize", String(options.fontSize));

    yield* this.http.requestSSE({
      method: "POST",
      path: "/v1/resumes/parse",
      body: form,
    });
  }
}
