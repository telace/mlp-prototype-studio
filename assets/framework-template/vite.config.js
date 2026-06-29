import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), mlpLocalNotesEditor()],
  base: './'
});

function mlpLocalNotesEditor() {
  const editsPath = resolve(process.cwd(), 'src/project/notes/local-edits.json');

  return {
    name: 'mlp-local-notes-editor',
    configureServer(server) {
      server.middlewares.use('/__mlp/api/notes/update', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
          return;
        }

        try {
          const payload = JSON.parse(await readBody(req));
          const result = saveLocalNoteEdit(payload);
          sendJson(res, 200, { ok: true, ...result });
        } catch (error) {
          sendJson(res, error.statusCode || 500, {
            ok: false,
            error: error.code || 'save_failed',
            message: error.message || '保存失败'
          });
        }
      });
      server.middlewares.use('/__mlp/api/notes/check', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
          return;
        }

        try {
          const payload = JSON.parse(await readBody(req));
          const result = setLocalNoteChecked(payload);
          sendJson(res, 200, { ok: true, ...result });
        } catch (error) {
          sendJson(res, error.statusCode || 500, {
            ok: false,
            error: error.code || 'check_failed',
            message: error.message || '更新 check 状态失败'
          });
        }
      });
    }
  };

  function setLocalNoteChecked(payload) {
    const { target = 'interaction', pageId, stateId = '__default', itemId, caseId, checked } = payload || {};
    if (!pageId || !itemId || typeof checked !== 'boolean') {
      throwHttp(400, 'invalid_payload', 'check 参数不完整。');
    }

    const file = readEditsFile();
    const bucketKey = target === 'overview' ? 'pages' : target === 'test' ? 'tests' : 'items';
    const bucket = file[bucketKey] || {};
    const pageItems = bucket[pageId] || {};
    const stateItems = pageItems[stateId] || {};
    const existing = stateItems[itemId] || {};
    const updatedAt = new Date().toISOString();
    const nextItem = target === 'test' && caseId
      ? {
          ...existing,
          cases: {
            ...(existing.cases || {}),
            [caseId]: {
              ...(existing.cases?.[caseId] || {}),
              checked,
              checkedBy: checked ? 'human' : '',
              updatedAt
            }
          },
          updatedAt
        }
      : {
          ...existing,
          checked,
          checkedBy: checked ? 'human' : '',
          updatedAt
        };

    bucket[pageId] = {
      ...pageItems,
      [stateId]: {
        ...stateItems,
        [itemId]: nextItem
      }
    };

    writeJson(editsPath, {
      version: 1,
      updatedAt,
      items: file.items || {},
      pages: file.pages || {},
      tests: file.tests || {},
      [bucketKey]: bucket
    });

    return { item: nextItem, hash: stableHash(toComparableFields(nextItem, target)) };
  }

  function saveLocalNoteEdit(payload) {
    const { target = 'interaction', pageId, stateId = '__default', itemId, expectedHash, fields } = payload || {};
    if (!pageId || !itemId || !fields || typeof fields !== 'object') {
      throwHttp(400, 'invalid_payload', '保存参数不完整。');
    }

    const validationError = validateFields(fields, target);
    if (validationError) {
      throwHttp(400, 'validation_failed', validationError);
    }

    const file = readEditsFile();
    const bucketKey = target === 'overview' ? 'pages' : target === 'test' ? 'tests' : 'items';
    const bucket = file[bucketKey] || {};
    const pageItems = bucket[pageId] || {};
    const stateItems = pageItems[stateId] || {};
    const existing = stateItems[itemId] || null;
    const existingCase = target === 'test' && fields.caseId ? existing?.cases?.[fields.caseId] : null;
    const currentHash = existing
      ? stableHash(target === 'test' && fields.caseId
        ? {
            caseId: fields.caseId,
            cases: {
              [fields.caseId]: existingCase || fields.cases?.[fields.caseId] || {}
            }
          }
        : toComparableFields(existing, target))
      : expectedHash;

    if (existing && expectedHash && currentHash !== expectedHash) {
      throwHttp(409, 'conflict', '当前说明已被其他窗口或 Codex 修改，请刷新后再编辑。');
    }

    const mergedFields = target === 'test' && fields.cases
      ? {
          ...fields,
          cases: {
            ...(existing?.cases || {}),
            ...fields.cases
          }
        }
      : fields;

    const nextItem = {
      ...existing,
      ...mergedFields,
      checked: true,
      checkedBy: 'human',
      reviewed: false,
      updatedAt: new Date().toISOString()
    };

    bucket[pageId] = {
      ...pageItems,
      [stateId]: {
        ...stateItems,
        [itemId]: nextItem
      }
    };

    writeJson(editsPath, {
      version: 1,
      updatedAt: nextItem.updatedAt,
      items: file.items || {},
      pages: file.pages || {},
      tests: file.tests || {},
      [bucketKey]: bucket
    });

    return { item: nextItem, hash: stableHash(toComparableFields(nextItem, target)) };
  }

  function readEditsFile() {
    if (!existsSync(editsPath)) return { version: 1, items: {}, pages: {}, tests: {} };
    try {
      return JSON.parse(readFileSync(editsPath, 'utf8'));
    } catch {
      throwHttp(500, 'invalid_edits_file', 'local-edits.json 不是合法 JSON，已阻止写入。');
    }
  }
}

function toComparableFields(item, target = 'interaction') {
  const keys = target === 'overview'
    ? ['title', 'purpose', 'parentPage', 'childPages', 'elements']
    : target === 'test'
      ? ['cases']
      : ['kind', 'type', 'title', 'effect', 'dataSource', 'composition', 'states', 'fields'];
  return Object.fromEntries(keys.map((key) => [key, item?.[key] || '']));
}

function validateFields(fields, target = 'interaction') {
  const required = target === 'overview'
    ? ['title', 'purpose', 'parentPage', 'childPages', 'elements']
    : target === 'test'
      ? []
      : ['type', 'composition', 'effect', 'fields'];
  for (const key of required) {
    if (!String(fields[key] || '').trim()) return `${key} 不能为空。`;
  }
  const validateLength = (value, path) => {
    if (typeof value === 'string' && value.length > 2000) return `${path} 不能超过 2000 字。`;
    if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        const error = validateLength(childValue, `${path}.${childKey}`);
        if (error) return error;
      }
    }
    return '';
  };
  for (const [key, value] of Object.entries(fields)) {
    const error = validateLength(value, key);
    if (error) return error;
  }
  return '';
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 64 * 1024) {
        reject(Object.assign(new Error('请求内容过大。'), { statusCode: 413, code: 'payload_too_large' }));
      }
    });
    req.on('end', () => resolveBody(body || '{}'));
    req.on('error', reject);
  });
}

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function stableHash(value) {
  const input = stableStringify(value);
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
    hash >>>= 0;
  }
  return hash.toString(16);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function throwHttp(statusCode, code, message) {
  throw Object.assign(new Error(message), { statusCode, code });
}
