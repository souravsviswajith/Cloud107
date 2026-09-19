// -----------------------------------------------------------------------
// <copyright file="IUpdateSource.cs" company="Cloud107">
// Copyright (c) Cloud107 contributors. All rights reserved.
// Licensed under the AGPL-3.0-or-later license.
// </copyright>
// -----------------------------------------------------------------------

namespace Cloud107.CLI.Updates;

/// <summary>
/// Interchangeable source provider contract for discovering updates,
/// resolving signed manifests, and acquiring release artifacts.
/// </summary>
public interface IUpdateSource
{
    /// <summary>
    /// Gets the unique identifier and scheme of the source provider (e.g., "git", "signed-artifact", "oci").
    /// </summary>
    string SourceScheme { get; }

    /// <summary>
    /// Gets the canonical URI or location of the update source repository.
    /// </summary>
    Uri CanonicalOrigin { get; }

    /// <summary>
    /// Discovers available updates and evaluates if a newer compatible release exists.
    /// </summary>
    /// <param name="currentVersion">The currently executing runtime version.</param>
    /// <param name="targetChannel">Target release channel (e.g., "stable", "beta", "lts").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Metadata describing the available update, or null if already up to date.</returns>
    Task<UpdateManifest?> DiscoverUpdateAsync(
        Version currentVersion,
        string targetChannel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetches the raw digital signature payload corresponding to the release manifest.
    /// </summary>
    /// <param name="manifest">Target release manifest.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detached Ed25519 or cryptographic signature bytes.</returns>
    Task<byte[]> FetchSignatureAsync(
        UpdateManifest manifest,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetches and stages the release artifacts or source tree into the target staging directory.
    /// </summary>
    /// <param name="manifest">Target release manifest.</param>
    /// <param name="stagingPath">Isolated directory path where artifacts must be unpacked.</param>
    /// <param name="progress">Progress callback reporting percentage and status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task FetchAndStageArtifactsAsync(
        UpdateManifest manifest,
        string stagingPath,
        IProgress<UpdateProgressReport>? progress = default,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Progress reporting payload for staged update downloads and compilations.
/// </summary>
public record UpdateProgressReport(
    double Percentage,
    string CurrentStep,
    long BytesProcessed,
    long TotalBytes);
