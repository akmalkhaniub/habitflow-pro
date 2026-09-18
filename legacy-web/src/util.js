import path from 'path';

/**
 * Resolve a request URL to a file inside `publicDir`, rejecting any path that
 * would escape the directory (path-traversal protection).
 *
 * @param {string} publicDir Absolute path to the public assets directory.
 * @param {string} urlPath   Raw request URL (may contain a query string).
 * @returns {string|null}    Absolute file path inside publicDir, or null if unsafe.
 */
export function resolveSafePath(publicDir, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  } catch {
    return null;
  }
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(publicDir, relative);
  if (resolved !== publicDir && !resolved.startsWith(publicDir + path.sep)) {
    return null;
  }
  return resolved;
}

/**
 * Read and JSON-parse a request body with a hard size cap to prevent unbounded
 * memory growth from malicious or malformed clients.
 *
 * @param {import('http').IncomingMessage} req
 * @param {{ limitBytes?: number }} [options]
 * @returns {Promise<any>} Parsed JSON. Rejects with an Error whose `.statusCode`
 *   is 413 (too large) or 400 (invalid JSON).
 */
export function readJsonBody(req, { limitBytes = 64 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let aborted = false;
    const chunks = [];
    req.on('data', (chunk) => {
      if (aborted) return;
      size += chunk.length;
      if (size > limitBytes) {
        aborted = true;
        const err = new Error('Request body too large');
        err.statusCode = 413;
        reject(err);
        // Discard the rest of the upload without killing the socket, so the
        // caller can still write a 413 response the client will receive.
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        const err = new Error('Invalid JSON body');
        err.statusCode = 400;
        reject(err);
      }
    });
    req.on('error', reject);
  });
}
