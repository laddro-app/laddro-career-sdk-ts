import { LaddroAPIError, LaddroAuthError, LaddroNotFoundError, LaddroUsageLimitError } from "./errors.js";
import type { SSEEvent } from "./types.js";

export interface RequestOptions {
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | undefined>;
  stream?: boolean;
}

export class HttpClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const headers: Record<string, string> = {
      ...options.headers,
    };

    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers["content-type"] = "application/json";
    }

    if (options.stream) {
      headers["accept"] = "text/event-stream";
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  async requestBinary(options: RequestOptions): Promise<ArrayBuffer> {
    const url = this.buildUrl(options.path, options.query);
    const headers: Record<string, string> = {
      ...options.headers,
    };

    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers["content-type"] = "application/json";
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.arrayBuffer();
  }

  async *requestSSE(options: RequestOptions): AsyncGenerator<SSEEvent> {
    const url = this.buildUrl(options.path, options.query);
    const headers: Record<string, string> = {
      accept: "text/event-stream",
      ...options.headers,
    };

    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers["content-type"] = "application/json";
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    if (!response.body) {
      throw new LaddroAPIError("No response body for SSE stream", 500);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim() as SSEEvent["event"];
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (currentEvent) {
              yield { event: currentEvent as SSEEvent["event"], data };
              currentEvent = "";
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async handleError(response: Response): Promise<never> {
    let body: { error?: string; code?: string } = {};
    try {
      body = await response.json() as { error?: string; code?: string };
    } catch {
      body = { error: response.statusText };
    }

    const message = body.error || response.statusText;

    switch (response.status) {
      case 401:
        throw new LaddroAuthError(message);
      case 402:
        throw new LaddroUsageLimitError(message);
      case 404:
        throw new LaddroNotFoundError(message);
      default:
        throw new LaddroAPIError(message, response.status, body.code);
    }
  }
}
