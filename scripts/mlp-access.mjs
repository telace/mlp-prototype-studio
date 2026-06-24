import { join } from 'node:path';
import { hashPassword, mlpDir, readAccess, resolveProject, writeJson } from './mlp-utils.mjs';

const [command, projectArg, ...rest] = process.argv.slice(2);

if (!command || !projectArg) usage();

const projectRoot = resolveProject(projectArg);
const accessPath = join(mlpDir(projectRoot), 'access.json');

if (command === 'show') {
  console.log(JSON.stringify(readAccess(projectRoot), null, 2));
  process.exit(0);
}

if (command === 'public') {
  writeJson(accessPath, { mode: 'public', updatedAt: new Date().toISOString() });
  console.log(`Set project access to public: ${projectRoot}`);
  process.exit(0);
}

if (command === 'password') {
  const password = rest[0] || process.env.MLP_ACCESS_PASSWORD;
  if (!password || password.length < 4) {
    console.error('Password is required and must be at least 4 characters. Pass it as an argument or set MLP_ACCESS_PASSWORD.');
    process.exit(1);
  }
  const credential = hashPassword(password);
  writeJson(accessPath, {
    mode: 'password',
    credential,
    updatedAt: new Date().toISOString(),
    note: 'Do not store plaintext passwords. This hash is for MLP metadata; server enforcement still needs Nginx Basic Auth or an application auth layer.'
  });
  console.log(`Set project access to password: ${projectRoot}`);
  process.exit(0);
}

usage();

function usage() {
  console.error(`Usage:
  mlp-access.mjs show <project>
  mlp-access.mjs public <project>
  mlp-access.mjs password <project> <password>`);
  process.exit(1);
}
