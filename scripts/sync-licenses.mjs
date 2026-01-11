#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

// ✅ Change these if your filenames differ
const ROOT_LICENSE_CANDIDATES = ["LICENSE", "LICENSE.md", "LICENSE.txt"];
const ROOT_THIRD_PARTY_CANDIDATES = [
  "THIRD_PARTY_LICENSES.md",
  "THIRD-PARTY-NOTICES.md",
  "NOTICE",
  "NOTICE.md",
];

// Where your independently published packages live
const PACKAGES_GLOB_ROOT = path.join(repoRoot, "packages", "react");

const DEST_LICENSE_NAME = "LICENSE.md";
const DEST_THIRD_PARTY_NAME = "THIRD_PARTY_LICENSES.md";

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findFirstExisting(candidates) {
  for (const name of candidates) {
    const p = path.join(repoRoot, name);
    if (await fileExists(p)) return p;
  }
  return null;
}

async function listDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => path.join(dir, e.name));
}

// Treat any directory with a package.json as a package
async function isPackageDir(dir) {
  return fileExists(path.join(dir, "package.json"));
}

async function main() {
  const rootLicensePath = await findFirstExisting(ROOT_LICENSE_CANDIDATES);
  if (!rootLicensePath) {
    throw new Error(
      `Could not find root license file. Tried: ${ROOT_LICENSE_CANDIDATES.join(", ")}`
    );
  }

  const rootThirdPartyPath = await findFirstExisting(ROOT_THIRD_PARTY_CANDIDATES);
  if (!rootThirdPartyPath) {
    throw new Error(
      `Could not find root third-party notices file. Tried: ${ROOT_THIRD_PARTY_CANDIDATES.join(
        ", "
      )}`
    );
  }

  const rootLicense = await fs.readFile(rootLicensePath, "utf8");
  const rootThirdParty = await fs.readFile(rootThirdPartyPath, "utf8");

  if (!(await fileExists(PACKAGES_GLOB_ROOT))) {
    throw new Error(`Directory not found: ${PACKAGES_GLOB_ROOT}`);
  }

  const candidateDirs = await listDirs(PACKAGES_GLOB_ROOT);
  const packageDirs = [];
  for (const dir of candidateDirs) {
    if (await isPackageDir(dir)) packageDirs.push(dir);
  }

  if (packageDirs.length === 0) {
    console.log(`No package directories found under: ${PACKAGES_GLOB_ROOT}`);
    process.exit(0);
  }

  const results = [];
  for (const pkgDir of packageDirs) {
    const licenseDest = path.join(pkgDir, DEST_LICENSE_NAME);
    const thirdPartyDest = path.join(pkgDir, DEST_THIRD_PARTY_NAME);

    await fs.writeFile(licenseDest, rootLicense, "utf8");
    await fs.writeFile(thirdPartyDest, rootThirdParty, "utf8");

    results.push({
      package: path.relative(repoRoot, pkgDir),
      license: path.relative(repoRoot, licenseDest),
      thirdParty: path.relative(repoRoot, thirdPartyDest),
    });
  }

  console.log(`Synced license files to ${results.length} package(s):`);
  for (const r of results) {
    console.log(`- ${r.package}`);
    console.log(`  - ${r.license}`);
    console.log(`  - ${r.thirdParty}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
