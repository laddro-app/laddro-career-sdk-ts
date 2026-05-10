import type { HttpClient } from "../http.js";
import type { ExportRequest, SSEEvent } from "../types.js";

export class Export {
  constructor(private http: HttpClient) {}

  async pdf(request: ExportRequest): Promise<ArrayBuffer> {
    return this.http.requestBinary({
      method: "POST",
      path: "/v1/export",
      body: request,
    });
  }

  async *stream(request: ExportRequest): AsyncGenerator<SSEEvent> {
    yield* this.http.requestSSE({
      method: "POST",
      path: "/v1/export",
      body: request,
    });
  }
}
