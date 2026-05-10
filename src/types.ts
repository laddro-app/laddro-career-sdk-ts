export interface LaddroConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ResumeSummary {
  id: string;
  resumeId: string;
  title: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  atsScore: number;
  layoutType: "single-column" | "two-column" | "two-column-sidebar";
  supportsProfileImage: boolean;
  defaults: TemplateDefaults;
}

export interface TemplateDefaults {
  pageSize: string;
  spacing: number;
  fontSize: number;
  font: string;
  pageNumbering: PageNumbering;
}

export interface TemplateColor {
  id: string;
  backgroundColor: string;
  backgroundPartColor?: string;
  underlineColor?: string;
  text?: string;
  textMuted?: string;
}

export interface TemplateFont {
  family: string;
  label: string;
}

export interface TemplateDetail extends Template {
  availableColors: TemplateColor[];
  availableFonts: TemplateFont[];
}

export interface ModelProvider {
  provider: string;
  name: string;
  baseUrl: string;
  models: Model[];
  keyPrefix: string;
  docsUrl: string;
}

export interface Model {
  id: string;
  name: string;
  recommended: boolean;
}

export interface Language {
  code: string;
  name: string;
}

export type PageNumbering = "none" | "simple" | "fraction" | "page";

export interface RenderOptions {
  templateId: string;
  locale?: string;
  colorId?: string;
  font?: string;
  spacing?: number;
  margin?: number;
  fontSize?: number;
  showProfileImage?: boolean;
  profileImageUrl?: string;
  pageNumbering?: PageNumbering;
}

export interface TailorRequest {
  resumeId?: string;
  positionName: string;
  jobDescription?: string;
  jobUrl?: string;
  mode?: "standard" | "new";
  language?: string;
  includeCoverLetter?: boolean;
  templateId?: string;
  colorId?: string;
  font?: string;
  spacing?: number;
  margin?: number;
  fontSize?: number;
  pageNumbering?: PageNumbering;
}

export interface CoverLetterSummary {
  id: string;
  coverLetterId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoverLetterRequest {
  title?: string;
  fullName: string;
  jobTitle?: string;
  address?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  hiringManager?: string;
  letterContent: string;
}

export interface CreateCoverLetterResponse {
  coverLetterId: string;
  title: string;
  status: string;
}

export interface GenerateCoverLetterRequest {
  resumeId?: string;
  positionName: string;
  jobDescription?: string;
  jobUrl?: string;
  language?: string;
  templateId?: string;
  colorId?: string;
  font?: string;
  spacing?: number;
  margin?: number;
  fontSize?: number;
  pageNumbering?: PageNumbering;
}

export interface ExportRequest {
  resumeId: string;
  templateId?: string;
  locale?: string;
  colorId?: string;
  font?: string;
  spacing?: number;
  margin?: number;
  fontSize?: number;
  showProfileImage?: boolean;
  profileImageUrl?: string;
  pageNumbering?: PageNumbering;
}

export interface AISettings {
  provider: string;
  model: string;
  baseUrl: string;
  hasApiKey: boolean;
  updatedAt?: string;
}

export interface SettingsResponse {
  ai: AISettings | null;
}

export interface UpdateAISettingsRequest {
  provider: string;
  model?: string;
  apiKey: string;
}

export interface SSEEvent {
  event: "progress" | "complete" | "error";
  data: string;
}

export interface LaddroError {
  error: string;
  code?: string;
  status: number;
}
