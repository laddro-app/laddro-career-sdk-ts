import type { HttpClient } from "../http.js";
import type { BinaryResponse, SSEEvent, TailorRequest } from "../types.js";

export interface TailorFileRequest extends Omit<TailorRequest, "resumeId"> {
  file: Blob | Buffer;
  filename?: string;
}

export class Tailor {
  constructor(private http: HttpClient) {}

  async run(request: TailorRequest): Promise<ArrayBuffer> {
    return this.http.requestBinary({
      method: "POST",
      path: "/v1/tailor",
      body: request,
    });
  }

  async runDetailed(request: TailorRequest): Promise<BinaryResponse> {
    return this.http.requestBinaryDetailed({
      method: "POST",
      path: "/v1/tailor",
      body: request,
    });
  }

  async upload(request: TailorFileRequest): Promise<ArrayBuffer> {
    const form = this.buildForm(request);
    return this.http.requestBinary({
      method: "POST",
      path: "/v1/tailor",
      body: form,
    });
  }

  async uploadDetailed(request: TailorFileRequest): Promise<BinaryResponse> {
    const form = this.buildForm(request);
    return this.http.requestBinaryDetailed({
      method: "POST",
      path: "/v1/tailor",
      body: form,
    });
  }

  async *stream(request: TailorRequest): AsyncGenerator<SSEEvent> {
    yield* this.http.requestSSE({
      method: "POST",
      path: "/v1/tailor",
      body: request,
    });
  }

  async *uploadStream(request: TailorFileRequest): AsyncGenerator<SSEEvent> {
    const form = this.buildForm(request);
    yield* this.http.requestSSE({
      method: "POST",
      path: "/v1/tailor",
      body: form,
    });
  }

  private buildForm(request: TailorFileRequest): FormData {
    const form = new FormData();
    const blob = request.file instanceof Blob
      ? request.file
      : new Blob([request.file]);
    form.append("file", blob, request.filename || "resume.pdf");
    form.append("positionName", request.positionName);

    if (request.jobDescription) form.append("jobDescription", request.jobDescription);
    if (request.jobUrl) form.append("jobUrl", request.jobUrl);
    if (request.mode) form.append("mode", request.mode);
    if (request.language) form.append("language", request.language);
    if (request.includeCoverLetter !== undefined) form.append("includeCoverLetter", String(request.includeCoverLetter));

    return form;
  }
}
