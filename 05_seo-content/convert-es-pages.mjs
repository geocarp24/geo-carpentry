#!/usr/bin/env node
// convert-es-pages.mjs
// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCCIONES PARA CLAUDE CODE:
//   1. Colocar este script en la raíz del repo: geo-carpentry/
//   2. Colocar el archivo fuente en:          geo-carpentry/investoros_es_pages.md
//      (copiar desde Memory Claude/05_seo-content/investoros_es_pages.md)
//   3. Ejecutar: node convert-es-pages.mjs
//   4. Los 30 archivos .md se generarán en:  apps/investoros/content/es/
//
// El script parsea el archivo fuente (formato custom) y genera
// 30 archivos .md con frontmatter YAML válido para gray-matter.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuración ────────────────────────────────────────────────────────────

const SOURCE_FILE = path.join(__dirname, 'investoros_es_pages.md');
const OUTPUT_DIR  = path.join(__dirname, 'apps', 'investoros', 'content', 'es');

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * El archivo fuente tiene el siguiente formato (sin YAML estándar):
 *
 *   ---                              ← separador (ignorar líneas con solo ---)
 *
 *   slug: xxx
 *   title: xxx
 *   metaDescription: xxx
 *   h1: xxx
 *   targetKeyword: xxx
 *   searchVolumeTier: high|medium|low
 *   hreflang: es
 *
 *   ---                              ← separador entre metadata y body
 *
 *   ## Artículo...
 *   Contenido markdown...
 *
 *   ---                              ← inicia siguiente página
 *
 *   slug: siguiente-slug
 *   ...
 *
 * Este parser extrae cada bloque y lo convierte a frontmatter YAML estándar.
 */
function parseSourceFile(raw) {
  const pages = [];

  // Dividir en secciones usando "---" como delimitador
  // Pero "---" también separa metadata de body dentro de cada page
  // Estrategia: buscar bloques que empiecen con "slug:"

  const lines = raw.split('\n');
  let currentMeta = {};
  let currentBody = [];
  let inMeta = false;
  let inBody = false;
  let metaDone = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip header comments (lines starting with #)
    if (trimmed.startsWith('#') && !inBody) continue;

    // Separator line
    if (trimmed === '---') {
      if (!inMeta && !inBody && !metaDone) {
        // Starting metadata section for this page
        inMeta = true;
        continue;
      }
      if (inMeta && !metaDone) {
        // Separator between meta and body
        inMeta = false;
        inBody = true;
        metaDone = true;
        continue;
      }
      if (inBody) {
        // End of body / start of next page
        if (Object.keys(currentMeta).length > 0 && currentBody.length > 0) {
          pages.push({
            meta: { ...currentMeta },
            body: currentBody.join('\n').trim(),
          });
        }
        // Reset for next page
        currentMeta = {};
        currentBody = [];
        inMeta = true;
        inBody = false;
        metaDone = false;
        continue;
      }
      continue;
    }

    // Parse metadata key: value
    if (inMeta) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim();
        if (key && value) {
          currentMeta[key] = value;
        }
      }
      continue;
    }

    // Collect body lines
    if (inBody) {
      currentBody.push(line);
    }
  }

  // Push last page if any
  if (Object.keys(currentMeta).length > 0 && currentBody.length > 0) {
    pages.push({
      meta: { ...currentMeta },
      body: currentBody.join('\n').trim(),
    });
  }

  return pages;
}

/**
 * Escape YAML string value — wrap in quotes if contains special chars
 */
function yamlValue(val) {
  if (!val) return '""';
  // If value contains : or # or starts with >, |, replace with quoted string
  if (val.includes(':') || val.includes('#') || val.includes('"') || val.includes("'")) {
    // Use double quotes, escape internal double quotes
    return `"${val.replace(/"/g, '\\"')}"`;
  }
  return val;
}

/**
 * Generate a properly-formatted .md file with YAML frontmatter
 */
function buildMarkdownFile(meta, body) {
  const fm = [
    '---',
    `slug: ${yamlValue(meta.slug || '')}`,
    `title: ${yamlValue(meta.title || '')}`,
    `metaDescription: ${yamlValue(meta.metaDescription || '')}`,
    `h1: ${yamlValue(meta.h1 || '')}`,
    `targetKeyword: ${yamlValue(meta.targetKeyword || '')}`,
    `searchVolumeTier: ${meta.searchVolumeTier || 'medium'}`,
    `hreflang: ${meta.hreflang || 'es'}`,
    '---',
    '',
    body,
    '',
  ].join('\n');
  return fm;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // Check source file
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`❌ Source file not found: ${SOURCE_FILE}`);
    console.error('   Copy investoros_es_pages.md to the repo root first.');
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Output directory: ${OUTPUT_DIR}`);

  // Parse source
  const raw = fs.readFileSync(SOURCE_FILE, 'utf-8');
  const pages = parseSourceFile(raw);

  console.log(`\n📄 Parsed ${pages.length} pages from source file\n`);

  if (pages.length === 0) {
    console.error('❌ No pages parsed. Check the source file format.');
    process.exit(1);
  }

  // Write each page
  let written = 0;
  const slugs = [];

  for (const page of pages) {
    const { meta, body } = page;

    if (!meta.slug) {
      console.warn(`⚠️  Skipping page with no slug: ${JSON.stringify(meta)}`);
      continue;
    }

    const filename = `${meta.slug}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);
    const content = buildMarkdownFile(meta, body);

    fs.writeFileSync(filepath, content, 'utf-8');
    slugs.push(meta.slug);
    written++;
    console.log(`  ✔ ${filename}`);
  }

  console.log(`\n✅ Written ${written} files to ${OUTPUT_DIR}`);

  // Print summary for verification
  console.log('\n📋 Slugs generated:');
  slugs.forEach((s, i) => console.log(`  ${i + 1}. /es/${s}`));

  // Verify count
  if (written !== 30) {
    console.warn(`\n⚠️  Expected 30 pages, got ${written}. Check the source file.`);
  } else {
    console.log('\n🎉 All 30 pages generated successfully!');
  }
}

main();
