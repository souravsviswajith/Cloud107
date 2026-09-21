import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ArtifactEntry, UpdateManifest } from './types';

/**
 * Cloud107 Sovereign Root Signing Authority Keys (Ed25519)
 *
 * Cryptographically trusted public keys embedded in the core distribution.
 */
export const CLOUD107_TRUSTED_KEYS: Record<string, string> = {
  'c107-root-2026': `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA4sM1z6h0m2W1oG4M5fPqjQ8rSvTuVwXyZ012345678A=
-----END PUBLIC KEY-----`,
  'c107-release-v1': `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA9rN8v4z2x1A3b5C7e9G1i3K5m7O9q1S3u5W7y9A1C3E=
-----END PUBLIC KEY-----`,
};

/**
 * Serializes a manifest object into canonical JSON format for deterministic signature verification.
 * Excludes the signature itself.
 */
export function getCanonicalManifestPayload(manifest: Omit<UpdateManifest, 'signature'>): string {
  const rest = { ...(manifest as Record<string, unknown>) };
  delete rest.signature;
  // Sort keys deterministically
  const sorted = Object.keys(rest)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (rest as Record<string, unknown>)[key];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

/**
 * Computes SHA-256 hex digest of given content.
 */
export function computeSha256(content: Buffer | string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Computes SHA-256 hex digest of a file on disk.
 */
export function computeFileSha256(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found for hash calculation: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);
  return computeSha256(buffer);
}

/**
 * Cryptographically verifies an Ed25519 digital signature of an update manifest.
 */
export function verifyManifestSignature(
  manifest: UpdateManifest,
  trustedKeys: Record<string, string> = CLOUD107_TRUSTED_KEYS,
): { valid: boolean; keyId?: string; error?: string } {
  try {
    const keyId = manifest.signingKeyId;
    const publicKeyPem = trustedKeys[keyId];

    if (!publicKeyPem) {
      return {
        valid: false,
        error: `Untrusted signing key ID: ${keyId}. Key is not present in local trusted keystore.`,
      };
    }

    const payload = getCanonicalManifestPayload(manifest);
    const signatureBuffer = Buffer.from(manifest.signature, 'base64');

    const isVerified = crypto.verify(
      null, // Ed25519 does not require a hash pre-algorithm
      Buffer.from(payload, 'utf8'),
      publicKeyPem,
      signatureBuffer,
    );

    return {
      valid: isVerified,
      keyId,
      error: isVerified
        ? undefined
        : 'Ed25519 digital signature verification failed: signature does not match manifest payload.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      error: `Cryptographic verification error: ${errorMsg}`,
    };
  }
}

/**
 * Generates an Ed25519 keypair for signing and verification.
 */
export function generateEd25519KeyPair(): {
  publicKeyPem: string;
  privateKeyPem: string;
  keyId: string;
} {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  const keyId = `c107-${computeSha256(publicKey).substring(0, 12)}`;
  return { publicKeyPem: publicKey, privateKeyPem: privateKey, keyId };
}

/**
 * Signs a manifest using an Ed25519 private key.
 */
export function signManifest(
  manifestWithoutSignature: Omit<UpdateManifest, 'signature'>,
  privateKeyPem: string,
): string {
  const payload = getCanonicalManifestPayload(manifestWithoutSignature);
  const signature = crypto.sign(null, Buffer.from(payload, 'utf8'), privateKeyPem);
  return signature.toString('base64');
}

/**
 * Verifies all artifacts listed in the manifest against the actual files on disk.
 */
export function verifyArtifactHashes(
  artifacts: ArtifactEntry[],
  baseDirectory: string,
): { valid: boolean; mismatchedFiles: string[]; missingFiles: string[] } {
  const mismatchedFiles: string[] = [];
  const missingFiles: string[] = [];

  for (const artifact of artifacts) {
    const fullPath = path.resolve(baseDirectory, artifact.path);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(artifact.path);
      continue;
    }

    const actualHash = computeFileSha256(fullPath);
    if (actualHash.toLowerCase() !== artifact.sha256.toLowerCase()) {
      mismatchedFiles.push(
        `${artifact.path} (expected sha256: ${artifact.sha256}, actual: ${actualHash})`,
      );
    }
  }

  const valid = mismatchedFiles.length === 0 && missingFiles.length === 0;
  return { valid, mismatchedFiles, missingFiles };
}
