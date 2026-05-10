#!/usr/bin/env npx tsx

import { Laddro } from "../src/index.js";

const client = new Laddro();

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

console.log("\n— Public endpoint tests (no auth, hitting api.laddro.com) —\n");

await test("list templates", async () => {
  const templates = await client.templates.list();
  if (templates.length < 20) throw new Error(`expected 20+ templates, got ${templates.length}`);
  if (!templates[0].id) throw new Error("template missing id");
  if (!templates[0].name) throw new Error("template missing name");
  console.log(`    → ${templates.length} templates`);
});

await test("get template GRAPHITE", async () => {
  const detail = await client.templates.get("GRAPHITE");
  if (detail.id !== "GRAPHITE") throw new Error("wrong id");
  if (detail.availableColors.length === 0) throw new Error("no colors");
  if (detail.availableFonts.length === 0) throw new Error("no fonts");
  console.log(`    → ${detail.availableColors.length} colors, ${detail.availableFonts.length} fonts`);
});

await test("list fonts", async () => {
  const fonts = await client.templates.fonts();
  if (fonts.length < 20) throw new Error(`expected 20+ fonts, got ${fonts.length}`);
  console.log(`    → ${fonts.length} fonts`);
});

await test("list languages", async () => {
  const languages = await client.templates.languages();
  if (languages.length !== 14) throw new Error(`expected 14 languages, got ${languages.length}`);
  if (!languages.find(l => l.code === "en")) throw new Error("missing English");
  if (!languages.find(l => l.code === "de")) throw new Error("missing German");
  console.log(`    → ${languages.length} languages`);
});

await test("list models", async () => {
  const models = await client.templates.models();
  if (models.length < 10) throw new Error(`expected 10+ providers, got ${models.length}`);
  if (!models.find(m => m.name === "OpenAI")) throw new Error("missing OpenAI");
  if (!models.find(m => m.name === "Anthropic")) throw new Error("missing Anthropic");
  console.log(`    → ${models.length} providers`);
});

console.log(`\n— Results: ${passed} passed, ${failed} failed —\n`);
process.exit(failed > 0 ? 1 : 0);
