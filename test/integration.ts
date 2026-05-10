#!/usr/bin/env npx tsx

import { Laddro, LaddroAuthError, LaddroUsageLimitError } from "../src/index.js";

const apiKey = process.env.LADDRO_API_KEY;
if (!apiKey) {
  console.error("Set LADDRO_API_KEY to run integration tests");
  process.exit(1);
}

const client = new Laddro({ apiKey });
const publicClient = new Laddro();

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

console.log("\n— Public endpoints (no auth) —\n");

await test("list templates", async () => {
  const templates = await publicClient.templates.list();
  assert(templates.length >= 20, `expected 20+ templates, got ${templates.length}`);
  assert(templates[0].id !== undefined, "template missing id");
  assert(templates[0].atsScore > 0, "template missing atsScore");
});

await test("get template detail", async () => {
  const detail = await publicClient.templates.get("GRAPHITE");
  assert(detail.id === "GRAPHITE", "wrong template id");
  assert(detail.availableColors.length > 0, "no colors");
  assert(detail.availableFonts.length > 0, "no fonts");
});

await test("list fonts", async () => {
  const fonts = await publicClient.templates.fonts();
  assert(fonts.length >= 20, `expected 20+ fonts, got ${fonts.length}`);
  assert(fonts[0].family !== undefined, "font missing family");
});

await test("list languages", async () => {
  const languages = await publicClient.templates.languages();
  assert(languages.length === 14, `expected 14 languages, got ${languages.length}`);
  assert(languages.some(l => l.code === "en"), "missing English");
  assert(languages.some(l => l.code === "de"), "missing German");
});

await test("list models", async () => {
  const models = await publicClient.templates.models();
  assert(models.length >= 10, `expected 10+ providers, got ${models.length}`);
  assert(models.some(m => m.name === "OpenAI"), "missing OpenAI");
  assert(models.some(m => m.name === "Anthropic"), "missing Anthropic");
});

console.log("\n— Protected endpoints (with auth) —\n");

await test("list resumes", async () => {
  const result = await client.resumes.list({ limit: 5 });
  assert(result.items !== undefined, "missing items");
  assert(typeof result.total === "number", "missing total");
  assert(result.limit === 5, "limit not respected");
});

await test("get settings", async () => {
  const result = await client.settings.get();
  assert("ai" in result, "missing ai field");
});

let resumeId: string | undefined;

await test("get first resume (if any)", async () => {
  const result = await client.resumes.list({ limit: 1 });
  if (result.items.length > 0) {
    resumeId = result.items[0].resumeId;
    const resume = await client.resumes.get(resumeId);
    assert(resume.resumeId === resumeId, "resume id mismatch");
  }
});

await test("list cover letters", async () => {
  const result = await client.coverLetters.list({ limit: 5 });
  assert(result.items !== undefined, "missing items");
  assert(typeof result.total === "number", "missing total");
});

if (resumeId) {
  await test("export resume as PDF", async () => {
    const pdf = await client.export.pdf({ resumeId: resumeId! });
    assert(pdf.byteLength > 1000, `PDF too small: ${pdf.byteLength} bytes`);
  });

  await test("render resume with template", async () => {
    const pdf = await client.resumes.render(resumeId!, {
      templateId: "GRAPHITE",
      font: "Inter",
    });
    assert(pdf.byteLength > 1000, `PDF too small: ${pdf.byteLength} bytes`);
  });

  await test("tailor resume (SSE stream)", async () => {
    let gotProgress = false;
    let gotComplete = false;
    for await (const event of client.tailor.stream({
      resumeId: resumeId!,
      positionName: "Integration Test Engineer",
      jobDescription: "We need someone who can write integration tests for APIs. Required: TypeScript, REST APIs, CI/CD.",
    })) {
      if (event.event === "progress") gotProgress = true;
      if (event.event === "complete") gotComplete = true;
    }
    assert(gotProgress, "never received progress event");
    assert(gotComplete, "never received complete event");
  });
}

await test("auth error on bad key", async () => {
  const bad = new Laddro({ apiKey: "laddro_live_invalid" });
  try {
    await bad.resumes.list();
    throw new Error("should have thrown");
  } catch (e: any) {
    assert(e instanceof LaddroAuthError, `expected LaddroAuthError, got ${e.constructor.name}`);
  }
});

console.log(`\n— Results: ${passed} passed, ${failed} failed —\n`);
process.exit(failed > 0 ? 1 : 0);
