# @laddro/career-sdk

TypeScript SDK for the [Laddro Career API](https://api.laddro.com/reference).

## Install

```bash
npm install @laddro/career-sdk
```

## Usage

```typescript
import { Laddro } from "@laddro/career-sdk";

const laddro = new Laddro({ apiKey: "laddro_live_..." });

// List your resumes
const { items } = await laddro.resumes.list();

// Tailor a resume for a job
const pdf = await laddro.tailor.run({
  positionName: "Senior Frontend Engineer",
  jobUrl: "https://jobs.example.com/senior-frontend",
});

// Stream progress events
for await (const event of laddro.tailor.stream({
  positionName: "Senior Frontend Engineer",
  jobDescription: "We are looking for...",
})) {
  if (event.event === "progress") console.log(event.data);
  if (event.event === "complete") console.log("Done:", event.data);
}

// Generate a cover letter
const coverLetter = await laddro.coverLetters.generate({
  positionName: "Product Manager",
  jobUrl: "https://jobs.example.com/pm",
});

// Export as PDF with a specific template
const exported = await laddro.export.pdf({
  resumeId: "abc-123",
  templateId: "GRAPHITE",
  colorId: "graphite-blue",
  font: "Inter",
});

// Browse templates (no auth needed)
const templates = await laddro.templates.list();

// Configure BYOK
await laddro.settings.updateModel({
  provider: "Anthropic",
  model: "claude-sonnet-4-20250514",
  apiKey: "sk-ant-...",
});
```

## Public endpoints

Templates, fonts, languages, and models don't require authentication:

```typescript
const laddro = new Laddro(); // no API key needed

const templates = await laddro.templates.list();
const fonts = await laddro.templates.fonts();
const languages = await laddro.templates.languages();
const models = await laddro.templates.models();
```

## File uploads

Parse a PDF or tailor from a file upload:

```typescript
import { readFile } from "fs/promises";

const file = await readFile("./resume.pdf");

// Parse and render with a template
const pdf = await laddro.resumes.parse({
  file,
  templateId: "GRAPHITE",
});

// Tailor from uploaded file
const tailored = await laddro.tailor.upload({
  file,
  positionName: "Backend Engineer",
  jobUrl: "https://jobs.example.com/backend",
});
```

## Error handling

```typescript
import { LaddroAPIError, LaddroAuthError, LaddroUsageLimitError } from "@laddro/career-sdk";

try {
  await laddro.tailor.run({ positionName: "Engineer", jobUrl: "..." });
} catch (e) {
  if (e instanceof LaddroUsageLimitError) {
    console.log("Buy more credits at developers.laddro.com");
  } else if (e instanceof LaddroAuthError) {
    console.log("Invalid API key");
  } else if (e instanceof LaddroAPIError) {
    console.log(`Error ${e.status}: ${e.message}`);
  }
}
```

## License

MIT
