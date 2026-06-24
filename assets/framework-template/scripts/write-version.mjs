import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(projectRoot, 'public');
const versionFile = join(publicDir, 'version.json');
const version = new Date().toISOString();

mkdirSync(publicDir, { recursive: true });
writeFileSync(versionFile, `${JSON.stringify({ version }, null, 2)}\n`);
console.log(`Wrote ${versionFile}: ${version}`);
