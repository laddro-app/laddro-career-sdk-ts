import type { HttpClient } from "../http.js";
import type { SettingsResponse, UpdateAISettingsRequest } from "../types.js";

export class Settings {
  constructor(private http: HttpClient) {}

  async get(): Promise<SettingsResponse> {
    return this.http.request<SettingsResponse>({
      method: "GET",
      path: "/v1/settings",
    });
  }

  async updateModel(request: UpdateAISettingsRequest): Promise<SettingsResponse> {
    return this.http.request<SettingsResponse>({
      method: "PUT",
      path: "/v1/settings/model",
      body: request,
    });
  }

  async deleteModel(): Promise<SettingsResponse> {
    return this.http.request<SettingsResponse>({
      method: "DELETE",
      path: "/v1/settings/model",
    });
  }
}
