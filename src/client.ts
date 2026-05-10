import { HttpClient } from "./http.js";
import { CoverLetters } from "./resources/cover-letters.js";
import { Export } from "./resources/export.js";
import { Resumes } from "./resources/resumes.js";
import { Settings } from "./resources/settings.js";
import { Tailor } from "./resources/tailor.js";
import { Templates } from "./resources/templates.js";
import type { LaddroConfig } from "./types.js";

const DEFAULT_BASE_URL = "https://api.laddro.com";

export class Laddro {
  readonly templates: Templates;
  readonly resumes: Resumes;
  readonly tailor: Tailor;
  readonly coverLetters: CoverLetters;
  readonly export: Export;
  readonly settings: Settings;

  constructor(config: LaddroConfig = {}) {
    const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    const http = new HttpClient(baseUrl, config.apiKey);

    this.templates = new Templates(http);
    this.resumes = new Resumes(http);
    this.tailor = new Tailor(http);
    this.coverLetters = new CoverLetters(http);
    this.export = new Export(http);
    this.settings = new Settings(http);
  }
}
