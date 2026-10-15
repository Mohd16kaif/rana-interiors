import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const DEFAULT_RAW_DIR = "D:\\ri-3D\\designs-raw";
const CLOUD_FOLDER = "rana/designs";
const CLOUD_NAME = "hygptczv";
const ALLOWED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function parseArgs(argv) {
  const args = argv.slice(2);
  let dir = DEFAULT_RAW_DIR;
  let dryRun = false;
  for (const a of args) {
    if (a === "--dry-run") dryRun = true;
    else if (!a.startsWith("--") && dir === DEFAULT_RAW_DIR) dir = a;
    else if (!a.startsWith("--")) dir = a;
  }
  // If first positional was consumed incorrectly when default was kept,
  // handle the case of no positional arg.
  const positionals = args.filter((a) => !a.startsWith("--"));
  if (positionals.length === 0) dir = DEFAULT_RAW_DIR;
  else dir = positionals[0];
  return { dir, dryRun };
}

function loadDotEnv(projectRoot) {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function loadConfig() {
  const cfgPath = path.join(PROJECT_ROOT, "src", "data", "design-config.json");
  const raw = fs.readFileSync(cfgPath, "utf8");
  return JSON.parse(raw);
}

function parseFileName(fileName, cfg) {
  const errors = [];
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, path.extname(fileName));
  const parts = base.split("__");
  if (parts.length !== 4) {
    return {
      ok: false,
      errors: [
        `expected 4 parts separated by "__" (type__space__room__source-ID), got ${parts.length}`,
      ],
    };
  }
  const [type, space, room, sourcePart] = parts;
  const typeIds = new Set(cfg.types.map((o) => o.id));
  const spaceIds = new Set(cfg.spaces.map((o) => o.id));
  const roomIds = new Set(cfg.rooms.map((o) => o.id));
  const sourceIds = new Set(cfg.sources.map((o) => o.id));

  if (!typeIds.has(type)) errors.push(`unknown type "${type}"`);
  if (!spaceIds.has(space)) errors.push(`unknown space "${space}"`);
  if (room !== "any" && !roomIds.has(room)) errors.push(`unknown room "${room}"`);

  const dash = sourcePart.indexOf("-");
  if (dash < 0) {
    errors.push(`bad source part "${sourcePart}", expected source-ID like ours-001`);
  } else {
    const source = sourcePart.slice(0, dash);
    const sourceId = sourcePart.slice(dash + 1);
    if (!sourceIds.has(source)) {
      errors.push(`unknown source "${source}"`);
    } else if (!sourceId) {
      errors.push(`missing source ID in "${sourcePart}"`);
    } else {
      if (source === "ours" && !/^[A-Za-z0-9_-]+$/.test(sourceId)) {
        errors.push(`bad ours ID "${sourceId}"`);
      }
      if (source === "pexels" && !/^\d+$/.test(sourceId)) {
        errors.push(`bad pexels ID "${sourceId}", expected digits`);
      }
      if (source === "unsplash" && !/^[A-Za-z0-9_-]+$/.test(sourceId)) {
        errors.push(`bad unsplash ID "${sourceId}"`);
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  const dash2 = sourcePart.indexOf("-");
  const source = sourcePart.slice(0, dash2);
  const sourceId = sourcePart.slice(dash2 + 1);
  return { ok: true, errors: [], type, space, room, source, sourceId, base, ext };
}

function creditUrlFor(source, sourceId) {
  if (source === "pexels") return `https://www.pexels.com/photo/${sourceId}/`;
  if (source === "unsplash") return `https://unsplash.com/photos/${sourceId}`;
  return undefined;
}

async function main() {
  const { dir, dryRun } = parseArgs(process.argv);
  const cfg = loadConfig();

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Raw folder not found: ${dir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => ALLOWED_EXTS.has(path.extname(n).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log(`No images found in ${dir} (jpg, jpeg, png, webp).`);
    return;
  }

  // Validate everything first, before any network work.
  const problems = [];
  const parsed = [];
  for (const f of files) {
    const r = parseFileName(f, cfg);
    if (!r.ok) {
      for (const e of r.errors) problems.push(`${f}: ${e}`);
    } else {
      parsed.push({ file: f, ...r });
    }
  }

  if (problems.length > 0) {
    console.error(`Found ${problems.length} problem(s) in ${dir}:`);
    for (const p of problems) console.error(`- ${p}`);
    console.error("Fix file names and run again. Nothing was uploaded.");
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] ${parsed.length} file(s) in ${dir} are valid. Would upload:`);
    for (const p of parsed) {
      console.log(
        `- ${p.file} -> ${CLOUD_FOLDER}/${p.base} [type=${p.type} space=${p.space} room=${p.room} source=${p.source}]`
      );
    }
    console.log("[dry-run] No network calls made. No .env needed.");
    return;
  }

  // Real run: .env required.
  loadDotEnv(PROJECT_ROOT);
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    console.error("Missing CLOUDINARY_URL. Add it to .env as CLOUDINARY_URL=cloudinary://... then retry.");
    process.exit(1);
  }

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({ secure: true });
  // cloudinary.config() picks up CLOUDINARY_URL from env automatically.

  // Upload new files only.
  let uploaded = 0;
  let skipped = 0;
  for (const p of parsed) {
    const publicIdWithFolder = `${CLOUD_FOLDER}/${p.base}`;
    let exists = false;
    try {
      await cloudinary.api.resource(publicIdWithFolder, { resource_type: "image" });
      exists = true;
    } catch {
      exists = false;
    }
    if (exists) {
      console.log(`Skip (exists): ${p.file}`);
      skipped++;
      continue;
    }
    const fullPath = path.join(dir, p.file);
    await cloudinary.uploader.upload(fullPath, {
      public_id: p.base,
      folder: CLOUD_FOLDER,
      overwrite: false,
      tags: [p.type, p.space, p.room, p.source],
      incoming_transformation: { width: 2000, crop: "limit", quality: "auto:good" },
      resource_type: "image",
    });
    console.log(`Uploaded: ${p.file}`);
    uploaded++;
  }
  console.log(`Upload done. New: ${uploaded}, skipped: ${skipped}.`);

  // List every image and rebuild designs.json.
  let all = [];
  let nextCursor = undefined;
  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: `${CLOUD_FOLDER}/`,
      max_results: 100,
      next_cursor: nextCursor,
      resource_type: "image",
    });
    all.push(...(res.resources || []));
    nextCursor = res.next_cursor;
  } while (nextCursor);

  const items = [];
  for (const r of all) {
    const fullId = r.public_id || "";
    const id = fullId.startsWith(`${CLOUD_FOLDER}/`)
      ? fullId.slice(CLOUD_FOLDER.length + 1)
      : fullId;
    const pr = parseFileName(id + ".jpg", cfg);
    if (!pr.ok) continue;
    const item = {
      id,
      v: r.version,
      w: r.width,
      h: r.height,
      type: pr.type,
      space: pr.space,
      room: pr.room,
      source: pr.source,
    };
    const credit = creditUrlFor(pr.source, pr.sourceId);
    if (credit) item.creditUrl = credit;
    item._created = r.created_at || "";
    items.push(item);
  }

  items.sort((a, b) => {
    const ao = a.source === "ours" ? 0 : 1;
    const bo = b.source === "ours" ? 0 : 1;
    if (ao !== bo) return ao - bo;
    const av = Number(a.v || 0);
    const bv = Number(b.v || 0);
    if (bv !== av) return bv - av;
    return String(b._created).localeCompare(String(a._created));
  });

  const outItems = items.map(({ _created, ...rest }) => rest);
  const out = {
    updated: new Date().toISOString(),
    cloud: CLOUD_NAME,
    items: outItems,
  };
  const outDir = path.join(PROJECT_ROOT, "public", "data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "designs.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote public/data/designs.json with ${outItems.length} item(s).`);
}

main().catch((e) => {
  console.error("sync-designs failed:", e && e.message ? e.message : e);
  process.exit(1);
});
