import type { HttpClient } from "../http.js";
import type {
  BinaryResponse,
  CoverLetterSummary,
  CreateCoverLetterRequest,
  CreateCoverLetterResponse,
  GenerateCoverLetterRequest,
  PaginatedList,
  PaginationParams,
  RenderOptions,
  SSEEvent,
} from "../types.js";

export interface GenerateCoverLetterFileRequest extends Omit<GenerateCoverLetterRequest, "resumeId"> {
  file: Blob | Buffer;
  filename?: string;
}

export class CoverLetters {
  constructor(private http: HttpClient) {}

  async list(params?: PaginationParams): Promise<PaginatedList<CoverLetterSummary>> {
    return this.http.request<PaginatedList<CoverLetterSummary>>({
      method: "GET",
      path: "/v1/cover-letters",
      query: {
        limit: params?.limit,
        offset: params?.offset,
      },
    });
  }

  async get(coverLetterId: string): Promise<CoverLetterSummary> {
    return this.http.request<CoverLetterSummary>({
      method: "GET",
      path: `/v1/cover-letters/${coverLetterId}`,
    });
  }

  async create(request: CreateCoverLetterRequest): Promise<CreateCoverLetterResponse> {
    return this.http.request<CreateCoverLetterResponse>({
      method: "POST",
      path: "/v1/cover-letters",
      body: request,
    });
  }

  async generate(request: GenerateCoverLetterRequest): Promise<ArrayBuffer> {
    return this.http.requestBinary({
      method: "POST",
      path: "/v1/cover-letters/generate",
      body: request,
    });
  }

  async generateDetailed(request: GenerateCoverLetterRequest): Promise<BinaryResponse> {
    return this.http.requestBinaryDetailed({
      method: "POST",
      path: "/v1/cover-letters/generate",
      body: request,
    });
  }

  async upload(request: GenerateCoverLetterFileRequest): Promise<ArrayBuffer> {
    const form = new FormData();
    const blob = request.file instanceof Blob
      ? request.file
      : new Blob([request.file]);
    form.append("file", blob, request.filename || "resume.pdf");
    form.append("positionName", request.positionName);

    if (request.jobDescription) form.append("jobDescription", request.jobDescription);
    if (request.jobUrl) form.append("jobUrl", request.jobUrl);
    if (request.language) form.append("language", request.language);

    return this.http.requestBinary({
      method: "POST",
      path: "/v1/cover-letters/generate",
      body: form,
    });
  }

  async uploadDetailed(request: GenerateCoverLetterFileRequest): Promise<BinaryResponse> {
    const form = new FormData();
    const blob = request.file instanceof Blob
      ? request.file
      : new Blob([request.file]);
    form.append("file", blob, request.filename || "resume.pdf");
    form.append("positionName", request.positionName);

    if (request.jobDescription) form.append("jobDescription", request.jobDescription);
    if (request.jobUrl) form.append("jobUrl", request.jobUrl);
    if (request.language) form.append("language", request.language);

    return this.http.requestBinaryDetailed({
      method: "POST",
      path: "/v1/cover-letters/generate",
      body: form,
    });
  }

  async render(coverLetterId: string, options: RenderOptions): Promise<ArrayBuffer> {
    return this.http.requestBinary({
      method: "PUT",
      path: `/v1/cover-letters/${coverLetterId}/render`,
      body: options,
    });
  }

  async *generateStream(request: GenerateCoverLetterRequest): AsyncGenerator<SSEEvent> {
    yield* this.http.requestSSE({
      method: "POST",
      path: "/v1/cover-letters/generate",
      body: request,
    });
  }
}
