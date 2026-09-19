// -----------------------------------------------------------------------
// <copyright file="UpdateManifest.cs" company="Cloud107">
// Copyright (c) Cloud107 contributors. All rights reserved.
// Licensed under the AGPL-3.0-or-later license.
// </copyright>
// -----------------------------------------------------------------------

namespace Cloud107.CLI.Updates;

/// <summary>
/// Cryptographically signed release manifest describing an available Cloud107 version.
/// </summary>
public record UpdateManifest(
    Version Version,
    string ReleaseChannel,
    string GitCommitHash,
    DateTimeOffset PublishedAt,
    string SignatureKeyId,
    string ManifestSignatureHex,
    IReadOnlyList<ArtifactChecksum> Artifacts,
    HardwareCompatibilityRequirement Compatibility,
    int TargetSchemaVersion,
    bool RequiresDatabaseMigration);

/// <summary>
/// Checksum entry for an artifact within the release tree.
/// </summary>
public record ArtifactChecksum(
    string RelativeFilePath,
    string Sha256HashHex,
    long FileSizeBytes);

/// <summary>
/// Hardware, kernel, and node architectural compatibility boundaries.
/// </summary>
public record HardwareCompatibilityRequirement(
    IReadOnlyList<string> SupportedArchitectures,
    IReadOnlyList<string> SupportedOperatingSystems,
    long MinRamBytes,
    long MinFreeDiskBytes,
    string MinimumKernelVersion);

/// <summary>
/// Local hardware and operating system profile evaluated against release requirements.
/// </summary>
public record LocalNodeProfile(
    string Architecture,
    string OperatingSystem,
    long AvailableRamBytes,
    long FreeDiskBytes,
    string KernelVersion,
    int CurrentSchemaVersion);
