import { CompatibilityReport, SystemEnvironment, UpdateManifest } from './types';

/**
 * Parses and compares semantic versions (MAJOR.MINOR.PATCH)
 * Returns -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
export function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => {
    const clean = v.replace(/^v/, '').split('-')[0];
    const parts = clean.split('.').map((p) => parseInt(p, 10) || 0);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  };

  const [maj1, min1, pat1] = parse(v1);
  const [maj2, min2, pat2] = parse(v2);

  if (maj1 !== maj2) return maj1 > maj2 ? 1 : -1;
  if (min1 !== min2) return min1 > min2 ? 1 : -1;
  if (pat1 !== pat2) return pat1 > pat2 ? 1 : -1;
  return 0;
}

/**
 * Verifies system and runtime compatibility for an incoming update manifest.
 */
export function verifyCompatibility(
  manifest: UpdateManifest,
  currentEnv: SystemEnvironment
): CompatibilityReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Version check: Target version must not be older than current unless explicitly allowed
  const targetVsCurrent = compareSemver(manifest.version, currentEnv.version);
  if (targetVsCurrent < 0) {
    warnings.push(
      `Downgrade warning: Target version (${manifest.version}) is lower than currently installed (${currentEnv.version}).`
    );
  } else if (targetVsCurrent === 0) {
    warnings.push(`Target version (${manifest.version}) is already installed.`);
  }

  // 2. Minimum Supported Version check: current version must be >= manifest.minSupportedVersion
  const currentVsMin = compareSemver(currentEnv.version, manifest.minSupportedVersion);
  let versionCompatible = true;
  if (currentVsMin < 0) {
    versionCompatible = false;
    errors.push(
      `Incompatible base version: Installed version (${currentEnv.version}) is lower than the minimum required upgrade base (${manifest.minSupportedVersion}). Please perform intermediate upgrades first.`
    );
  }

  // 3. Platform & Architecture check
  let platformCompatible = true;
  const currentPlatformKey = `${currentEnv.platform}-${currentEnv.arch}`;
  if (manifest.targetPlatform !== 'any' && manifest.targetPlatform !== currentPlatformKey) {
    // If platform target is generic or matches
    const matchesPlatform =
      (manifest.targetPlatform === 'linux-x64' && currentEnv.platform === 'linux' && currentEnv.arch === 'x64') ||
      (manifest.targetPlatform === 'darwin-arm64' && currentEnv.platform === 'darwin' && currentEnv.arch === 'arm64') ||
      (manifest.targetPlatform === 'win-x64' && currentEnv.platform === 'win32' && currentEnv.arch === 'x64');

    if (!matchesPlatform) {
      platformCompatible = false;
      errors.push(
        `Incompatible target platform: Update is compiled for ${manifest.targetPlatform}, but current host is ${currentPlatformKey}.`
      );
    }
  }

  // 4. Schema version compatibility
  let schemaCompatible = true;
  if (manifest.schemaVersion > currentEnv.schemaVersion + 2) {
    schemaCompatible = false;
    errors.push(
      `Incompatible schema version: Manifest requires schema version ${manifest.schemaVersion}, which is too far ahead of current schema version ${currentEnv.schemaVersion}.`
    );
  } else if (manifest.schemaVersion > currentEnv.schemaVersion) {
    warnings.push(
      `Database schema migration will be required from v${currentEnv.schemaVersion} to v${manifest.schemaVersion}.`
    );
  }

  const compatible = errors.length === 0;

  return {
    compatible,
    versionCompatible,
    platformCompatible,
    schemaCompatible,
    errors,
    warnings,
  };
}
