const { test } = require('node:test'); const assert = require('node:assert/strict');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { inventory } = require('./remote-inventory.cjs');
const expected = { projectId: 'synthetic-project', environmentId: 'synthetic-stage', serviceId: 'synthetic-service' };
const environment = { RAILWAY_PROJECT_ID: expected.projectId, RAILWAY_ENVIRONMENT_ID: expected.environmentId,
  RAILWAY_SERVICE_ID: expected.serviceId, RAILWAY_VOLUME_MOUNT_PATH: '/data' };
test('remote inventory hashes synthetic bytes, includes hidden files and empty directories', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cn-inventory-'));
  try {
    fs.writeFileSync(path.join(root, '.hidden'), ''); fs.mkdirSync(path.join(root, 'empty'));
    assert.deepEqual(await inventory(expected, root, environment), [
      { path: '.hidden', kind: 'file', size: 0, sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      { path: 'empty', kind: 'directory', size: 0, sha256: null }]);
    await assert.rejects(inventory(expected, root, { ...environment, RAILWAY_ENVIRONMENT_ID: 'wrong' }), /identity/);
    fs.writeFileSync(path.join(root, 'COM1.txt'), 'synthetic');
    await assert.rejects(inventory(expected, root, environment), /filename/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test('remote inventory refuses a directory junction/symlink', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cn-inventory-link-'));
  try {
    fs.mkdirSync(path.join(root, 'actual'));
    fs.symlinkSync(path.join(root, 'actual'), path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(inventory(expected, root, environment), /Symlink/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
