// Read-only operator-side command, executed remotely only by the backup tool.
// stdout contains inventory/hashes, never file contents. No credential logging.
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
async function inventory(expected, root = '/data', environment = process.env) {
  for (const [key, value] of Object.entries({ RAILWAY_PROJECT_ID: expected.projectId,
    RAILWAY_ENVIRONMENT_ID: expected.environmentId, RAILWAY_SERVICE_ID: expected.serviceId,
    RAILWAY_VOLUME_MOUNT_PATH: '/data' })) {
    if (environment[key] !== value) throw Error('Remote identity mismatch');
  }
  if (fs.realpathSync(root) !== path.resolve(root) || !fs.lstatSync(root).isDirectory()) throw Error('Unsafe mount');
  const entries = []; const seen = new Set();
  async function walk(dir, prefix = '') {
    for (const name of fs.readdirSync(dir).sort()) {
      // Fail closed on names Windows cannot preserve exactly, including ADS and case collisions.
      if (/[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) ||
          /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(name)) throw Error('Unsupported filename');
      const relative = prefix + name; const key = relative.toLowerCase();
      if (seen.has(key)) throw Error('Case collision'); seen.add(key);
      const full = path.join(dir, name); const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) throw Error('Symlink refused');
      if (stat.isDirectory()) { entries.push({ path: relative, kind: 'directory', size: 0, sha256: null }); await walk(full, relative + '/'); }
      else if (stat.isFile()) {
        const hash = crypto.createHash('sha256');
        for await (const chunk of fs.createReadStream(full)) hash.update(chunk);
        const after = fs.lstatSync(full);
        if (after.size !== stat.size || after.mtimeMs !== stat.mtimeMs || after.ino !== stat.ino) throw Error('File changed');
        entries.push({ path: relative, kind: 'file', size: stat.size, sha256: hash.digest('hex') });
      } else throw Error('Special file refused');
    }
  }
  await walk(root); return entries;
}
module.exports = { inventory };
