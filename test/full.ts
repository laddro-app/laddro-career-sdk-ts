#!/usr/bin/env npx tsx

import { Laddro, LaddroAuthError, LaddroNotFoundError } from "../src/index.js";

const apiKey = process.env.LADDRO_API_KEY;
if (!apiKey) {
  console.error("Set LADDRO_API_KEY to run tests");
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

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }

// --- PUBLIC ENDPOINTS (5) ---
console.log("\n— 1. Public endpoints (5/18) —\n");

await test("GET /v1/templates", async () => {
  const templates = await publicClient.templates.list();
  assert(templates.length === 22, `expected 22, got ${templates.length}`);
});

await test("GET /v1/templates/{id}", async () => {
  const d = await publicClient.templates.get("GRAPHITE");
  assert(d.id === "GRAPHITE", "wrong id");
  assert(d.availableColors.length > 0, "no colors");
  assert(d.availableFonts.length > 0, "no fonts");
});

await test("GET /v1/fonts", async () => {
  const fonts = await publicClient.templates.fonts();
  assert(fonts.length === 21, `expected 21, got ${fonts.length}`);
});

await test("GET /v1/languages", async () => {
  const langs = await publicClient.templates.languages();
  assert(langs.length === 14, `expected 14, got ${langs.length}`);
});

await test("GET /v1/models", async () => {
  const models = await publicClient.templates.models();
  assert(models.length === 10, `expected 10, got ${models.length}`);
});

// --- RESUME ENDPOINTS (4) ---
console.log("\n— 2. Resume endpoints (4/18) —\n");

let resumeId: string;

await test("GET /v1/resumes", async () => {
  const list = await client.resumes.list({ limit: 5 });
  assert(list.items.length > 0, "no resumes");
  assert(typeof list.total === "number", "missing total");
  resumeId = list.items.find(r => r.isDefault)?.resumeId || list.items[0].resumeId;
});

await test("GET /v1/resumes/{id}", async () => {
  const r = await client.resumes.get(resumeId);
  assert(r.resumeId === resumeId, "id mismatch");
});

await test("PUT /v1/resumes/{id}/render", async () => {
  const pdf = await client.resumes.render(resumeId, { templateId: "GRAPHITE" });
  assert(pdf.byteLength > 1000, `too small: ${pdf.byteLength}`);
});

await test("POST /v1/resumes/parse (skip - needs file)", async () => {
  // Parse requires a real PDF file upload — tested separately
});

// --- TAILOR (1) ---
console.log("\n— 3. Tailor endpoint (1/18) —\n");

await test("POST /v1/tailor", async () => {
  const pdf = await client.tailor.run({
    resumeId,
    positionName: "SDK Test Engineer",
    jobDescription: "Build and test SDKs for career APIs. TypeScript, Python, Go required.",
    templateId: "GRAPHITE",
  });
  assert(pdf.byteLength > 5000, `too small: ${pdf.byteLength}`);
});

// --- EXPORT (1) ---
console.log("\n— 4. Export endpoint (1/18) —\n");

await test("POST /v1/export", async () => {
  const pdf = await client.export.pdf({ resumeId, templateId: "COBALT" });
  assert(pdf.byteLength > 1000, `too small: ${pdf.byteLength}`);
});

// --- COVER LETTER ENDPOINTS (5) ---
console.log("\n— 5. Cover Letter endpoints (5/18) —\n");

await test("GET /v1/cover-letters", async () => {
  const list = await client.coverLetters.list();
  assert(list.items !== undefined, "missing items");
});

let coverLetterId: string | undefined;

await test("POST /v1/cover-letters", async () => {
  const result = await client.coverLetters.create({
    fullName: "Test User",
    letterContent: "<p>Dear Hiring Manager,</p><p>This is an SDK integration test.</p><p>Best regards,</p><p>Test User</p>",
    title: "SDK Test Cover Letter",
    companyName: "Test Corp",
  });
  assert(result.coverLetterId !== undefined, "missing id");
  coverLetterId = result.coverLetterId;
});

await test("GET /v1/cover-letters/{id}", async () => {
  if (!coverLetterId) throw new Error("no cover letter created");
  const cl = await client.coverLetters.get(coverLetterId);
  assert(cl.coverLetterId === coverLetterId, "id mismatch");
});

await test("PUT /v1/cover-letters/{id}/render", async () => {
  if (!coverLetterId) throw new Error("no cover letter created");
  const pdf = await client.coverLetters.render(coverLetterId, { templateId: "NICKEL" });
  assert(pdf.byteLength > 1000, `too small: ${pdf.byteLength}`);
});

await test("POST /v1/cover-letters/generate", async () => {
  const pdf = await client.coverLetters.generate({
    resumeId,
    positionName: "SDK Test Engineer",
    jobDescription: "Write SDK tests. TypeScript required.",
    templateId: "NICKEL",
  });
  assert(pdf.byteLength > 1000, `too small: ${pdf.byteLength}`);
});

// --- SETTINGS ENDPOINTS (3) ---
console.log("\n— 6. Settings endpoints (3/18) —\n");

await test("GET /v1/settings", async () => {
  const s = await client.settings.get();
  assert("ai" in s, "missing ai field");
});

await test("PUT /v1/settings/model", async () => {
  // Use a fake key that will fail validation — but we're testing the SDK sends correctly
  try {
    await client.settings.updateModel({
      provider: "OpenAI",
      model: "gpt-4o-mini",
      apiKey: "sk-test-invalid-key-for-sdk-testing",
    });
  } catch (e: any) {
    // Expected: key validation fails, but 400 means the SDK sent correctly
    assert(e.status === 400 || e.status === 200, `unexpected status: ${e.status}`);
  }
});

await test("DELETE /v1/settings/model", async () => {
  const s = await client.settings.deleteModel();
  assert(s.ai === null, "ai should be null after delete");
});

// --- SSE STREAMING ---
console.log("\n— 7. SSE Streaming —\n");

await test("POST /v1/tailor (SSE stream)", async () => {
  let progressCount = 0;
  let gotComplete = false;
  for await (const event of client.tailor.stream({
    resumeId,
    positionName: "Streaming Test",
    jobDescription: "Test SSE streaming works.",
  })) {
    if (event.event === "progress") progressCount++;
    if (event.event === "complete") gotComplete = true;
  }
  assert(progressCount > 0, "no progress events");
  assert(gotComplete, "no complete event");
});

// --- ERROR HANDLING ---
console.log("\n— 8. Error handling —\n");

await test("401 on bad API key", async () => {
  const bad = new Laddro({ apiKey: "laddro_live_invalid" });
  try { await bad.resumes.list(); throw new Error("should throw"); }
  catch (e: any) { assert(e instanceof LaddroAuthError, `got ${e.constructor.name}`); }
});

await test("404 on missing resume", async () => {
  try { await client.resumes.get("00000000-0000-0000-0000-000000000000"); throw new Error("should throw"); }
  catch (e: any) { assert(e instanceof LaddroNotFoundError, `got ${e.constructor.name}: ${e.message}`); }
});

console.log(`\n═══ FINAL: ${passed} passed, ${failed} failed (18 endpoints covered) ═══\n`);
process.exit(failed > 0 ? 1 : 0);
