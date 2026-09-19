/**
 * Cloud107 Source-First Update Protocol Types
 * 
 * Strict specifications for cryptographically verified updates, provenance checks,
 * compatibility matrices, recovery checkpoints, and fail-closed state machines.
 */

export type PlatformTarget = 'linux-x64' | 'darwin-arm64' | 'win-x64' | 'any';
export type ArchitectureTarget = 'x64' | 'arm64' | 'any';
export type UpdateChannel = 'stable' | 'beta' | 'nightly';

export interface ArtifactEntry {
  path: string;
  sha256: string;
  size: number;
}

export interface UpdateManifest {
  version: string;
  revision: string; // Git commit hash or canonical revision SHA
  timestamp: string; // ISO 8601
  channel: UpdateChannel;
  minSupportedVersion: string;
  schemaVersion: number;
  targetPlatform: PlatformTarget;
  targetArchitecture: ArchitectureTarget;
  canonicalOrigin: string; // e.g., https://github.com/cloud107/cloud107.git
  artifacts: ArtifactEntry[];
  signingKeyId: string;
  signature: string; // Cryptographic digital signature (Ed25519)
}

export interface VerificationResult {
  success: boolean;
  signatureValid: boolean;
  provenanceVerified: boolean;
  hashesValid: boolean;
  keyId?: string;
  error?: string;
}

export interface CompatibilityReport {
  compatible: boolean;
  versionCompatible: boolean;
  platformCompatible: boolean;
  schemaCompatible: boolean;
  errors: string[];
  warnings: string[];
}

export interface SystemEnvironment {
  version: string;
  platform: string; // process.platform
  arch: string; // process.arch
  nodeVersion: string;
  schemaVersion: number;
}

export interface Checkpoint {
  id: string;
  currentVersion: string;
  targetVersion: string;
  timestamp: number;
  backupPath: string;
  stagedPath: string;
  status: 'created' | 'staged' | 'activated' | 'committed' | 'rolled_back';
  metadata: Record<string, unknown>;
}

export interface UpdateOptions {
  channel?: UpdateChannel;
  targetVersion?: string;
  canonicalRemote?: string;
  dryRun?: boolean;
  force?: boolean;
  skipTests?: boolean;
  customManifest?: UpdateManifest;
  testFailStep?:
    | 'fetch_metadata'
    | 'verify_provenance'
    | 'verify_signature'
    | 'verify_hashes'
    | 'check_compatibility'
    | 'build'
    | 'test'
    | 'health_check'
    | 'post_verify';
}

export interface UpdateStepLog {
  step: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
}

export interface UpdateExecutionResult {
  success: boolean;
  previousVersion: string;
  currentVersion: string;
  checkpointId?: string;
  rolledBack: boolean;
  error?: string;
  steps: UpdateStepLog[];
}
