import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  generateEd25519KeyPair,
  signManifest,
  verifyManifestSignature,
  computeSha256,
  verifyArtifactHashes,
} from '../crypto';
import { verifyCompatibility, compareSemver } from '../compatibility';
import {
  createCheckpoint,
  rollbackToCheckpoint,
} from '../checkpoint';
import { executeUpdatePipeline } from '../pipeline';
import { UpdateManifest, SystemEnvironment } from '../types';

describe('Cloud107 Source-First Update Protocol', () => {
  const originalPkg = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8');

  afterEach(() => {
    // Ensure package.json is always restored
    fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), originalPkg, 'utf8');
  });

  describe('Semver Comparison', () => {
    it('compares versions correctly', () => {
      expect(compareSemver('1.0.7', '1.0.8')).toBe(-1);
      expect(compareSemver('1.1.0', '1.0.7')).toBe(1);
      expect(compareSemver('1.0.7', '1.0.7')).toBe(0);
      expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
    });
  });

  describe('Cryptographic Verification (Ed25519)', () => {
    it('validates authentic signatures and rejects forged payloads', () => {
      const { publicKeyPem, privateKeyPem, keyId } = generateEd25519KeyPair();
      const trustedKeys = { [keyId]: publicKeyPem };

      const unsignedManifest: Omit<UpdateManifest, 'signature'> = {
        version: '1.2.0',
        revision: 'abc1234',
        timestamp: new Date().toISOString(),
        channel: 'stable',
        minSupportedVersion: '1.0.0',
        schemaVersion: 1,
        targetPlatform: 'any',
        targetArchitecture: 'any',
        canonicalOrigin: 'https://github.com/cloud107/cloud107.git',
        artifacts: [],
        signingKeyId: keyId,
      };

      const signature = signManifest(unsignedManifest, privateKeyPem);
      const manifest: UpdateManifest = { ...unsignedManifest, signature };

      // 1. Valid signature
      const validResult = verifyManifestSignature(manifest, trustedKeys);
      expect(validResult.valid).toBe(true);

      // 2. Tampered version in payload
      const tamperedManifest: UpdateManifest = { ...manifest, version: '1.3.0' };
      const tamperedResult = verifyManifestSignature(tamperedManifest, trustedKeys);
      expect(tamperedResult.valid).toBe(false);

      // 3. Unknown signing key
      const unknownKeyResult = verifyManifestSignature(manifest, {});
      expect(unknownKeyResult.valid).toBe(false);
      expect(unknownKeyResult.error).toContain('Untrusted signing key ID');
    });

    it('verifies artifact SHA-256 hash trees correctly', () => {
      const testFilePath = path.resolve(process.cwd(), 'package.json');
      const realHash = computeSha256(fs.readFileSync(testFilePath));

      // Correct hash
      const passResult = verifyArtifactHashes(
        [{ path: 'package.json', sha256: realHash, size: 100 }],
        process.cwd()
      );
      expect(passResult.valid).toBe(true);

      // Tampered hash
      const failResult = verifyArtifactHashes(
        [{ path: 'package.json', sha256: 'deadbeef00000000000000000000000000000000000000000000000000000000', size: 100 }],
        process.cwd()
      );
      expect(failResult.valid).toBe(false);
      expect(failResult.mismatchedFiles.length).toBe(1);
    });
  });

  describe('Compatibility Verification Matrix', () => {
    const baseEnv: SystemEnvironment = {
      version: '1.0.7',
      platform: 'linux',
      arch: 'x64',
      nodeVersion: 'v22.0.0',
      schemaVersion: 1,
    };

    it('approves compatible updates', () => {
      const manifest: UpdateManifest = {
        version: '1.1.0',
        revision: 'rev-1',
        timestamp: new Date().toISOString(),
        channel: 'stable',
        minSupportedVersion: '1.0.0',
        schemaVersion: 1,
        targetPlatform: 'any',
        targetArchitecture: 'any',
        canonicalOrigin: 'https://github.com/cloud107/cloud107.git',
        artifacts: [],
        signingKeyId: 'key',
        signature: 'sig',
      };

      const report = verifyCompatibility(manifest, baseEnv);
      expect(report.compatible).toBe(true);
      expect(report.errors).toHaveLength(0);
    });

    it('rejects updates when current version is below minSupportedVersion', () => {
      const manifest: UpdateManifest = {
        version: '2.0.0',
        revision: 'rev-2',
        timestamp: new Date().toISOString(),
        channel: 'stable',
        minSupportedVersion: '1.2.0', // current is 1.0.7
        schemaVersion: 1,
        targetPlatform: 'any',
        targetArchitecture: 'any',
        canonicalOrigin: 'https://github.com/cloud107/cloud107.git',
        artifacts: [],
        signingKeyId: 'key',
        signature: 'sig',
      };

      const report = verifyCompatibility(manifest, baseEnv);
      expect(report.compatible).toBe(false);
      expect(report.errors[0]).toContain('Incompatible base version');
    });

    it('rejects incompatible target platform', () => {
      const manifest: UpdateManifest = {
        version: '1.1.0',
        revision: 'rev-1',
        timestamp: new Date().toISOString(),
        channel: 'stable',
        minSupportedVersion: '1.0.0',
        schemaVersion: 1,
        targetPlatform: 'win-x64', // current is linux-x64
        targetArchitecture: 'x64',
        canonicalOrigin: 'https://github.com/cloud107/cloud107.git',
        artifacts: [],
        signingKeyId: 'key',
        signature: 'sig',
      };

      const report = verifyCompatibility(manifest, baseEnv);
      expect(report.compatible).toBe(false);
      expect(report.errors[0]).toContain('Incompatible target platform');
    });
  });

  describe('Checkpoints & Fail-Closed Rollback', () => {
    it('creates recovery checkpoints and restores state on rollback', () => {
      const checkpoint = createCheckpoint('1.0.7', '1.1.0');
      expect(checkpoint.status).toBe('created');
      expect(fs.existsSync(checkpoint.backupPath)).toBe(true);

      // Simulate a change to package.json
      const pkgPath = path.resolve(process.cwd(), 'package.json');
      const modifiedPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      modifiedPkg.version = '9.9.9';
      fs.writeFileSync(pkgPath, JSON.stringify(modifiedPkg, null, 2), 'utf8');

      expect(JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version).toBe('9.9.9');

      // Execute rollback
      const rolledBack = rollbackToCheckpoint(checkpoint);
      expect(rolledBack).toBe(true);
      expect(checkpoint.status).toBe('rolled_back');

      // Check restored package.json
      const restoredPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      expect(restoredPkg.version).toBe('1.0.7');
    });
  });

  describe('Deterministic 15-Step Pipeline Execution', () => {
    it('executes dry-run update safely without modifying active state', async () => {
      const result = await executeUpdatePipeline({ dryRun: true, targetVersion: '1.1.0' });
      expect(result.success).toBe(true);
      expect(result.currentVersion).toBe('1.0.7'); // kept at current

      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
      expect(pkg.version).toBe('1.0.7');
    });

    it('executes live update atomically to completion', async () => {
      const result = await executeUpdatePipeline({ targetVersion: '1.0.8' });
      expect(result.success).toBe(true);
      expect(result.currentVersion).toBe('1.0.8');

      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
      expect(pkg.version).toBe('1.0.8');

      // Cleanly restore to 1.0.7 for other tests
      fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), originalPkg, 'utf8');
    });

    it('fails closed and rolls back automatically if tests fail during update', async () => {
      const result = await executeUpdatePipeline({
        targetVersion: '1.1.5',
        testFailStep: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.rolledBack).toBe(true);
      expect(result.error).toContain('Pre-activation regression tests failed');

      // Ensure package.json remains 1.0.7
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
      expect(pkg.version).toBe('1.0.7');
    });

    it('fails closed and rolls back automatically if health check fails', async () => {
      const result = await executeUpdatePipeline({
        targetVersion: '1.1.5',
        testFailStep: 'health_check',
      });

      expect(result.success).toBe(false);
      expect(result.rolledBack).toBe(true);
      expect(result.error).toContain('Staged health probe returned non-200 status');

      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
      expect(pkg.version).toBe('1.0.7');
    });

    it('rejects update before modifying state if provenance check fails', async () => {
      const result = await executeUpdatePipeline({
        testFailStep: 'verify_provenance',
      });

      expect(result.success).toBe(false);
      expect(result.rolledBack).toBe(false); // checkpoint was not even needed yet
      expect(result.error).toContain('provenance untrusted');
    });
  });
});
