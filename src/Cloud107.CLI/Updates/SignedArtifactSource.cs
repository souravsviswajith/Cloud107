// -----------------------------------------------------------------------
// <copyright file="SignedArtifactSource.cs" company="Cloud107">
// Copyright (c) Cloud107 contributors. All rights reserved.
// Licensed under the AGPL-3.0-or-later license.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.Json;

namespace Cloud107.CLI.Updates;

/// <summary>
/// Pre-compiled signed artifact source provider (e.g. self-hosted artifact storage or air-gapped repository).
/// </summary>
public sealed class SignedArtifactSource : IUpdateSource
{
    private readonly HttpClient _httpClient;

    public string SourceScheme => "signed-artifact";
    public Uri CanonicalOrigin { get; }

    public SignedArtifactSource(Uri canonicalOrigin, HttpClient? httpClient = null)
    {
        CanonicalOrigin = canonicalOrigin ?? throw new ArgumentNullException(nameof(canonicalOrigin));
        _httpClient = httpClient ?? new HttpClient();
    }

    public async Task<UpdateManifest?> DiscoverUpdateAsync(
        Version currentVersion,
        string targetChannel,
        CancellationToken cancellationToken = default)
    {
        var manifestUri = new Uri(CanonicalOrigin, $"manifests/{targetChannel}/latest.json");
        using var response = await _httpClient.GetAsync(manifestUri, cancellationToken);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        var jsonStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var manifest = await JsonSerializer.DeserializeAsync<UpdateManifest>(
            jsonStream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken);

        if (manifest != null && manifest.Version > currentVersion)
        {
            return manifest;
        }

        return null;
    }

    public async Task<byte[]> FetchSignatureAsync(
        UpdateManifest manifest,
        CancellationToken cancellationToken = default)
    {
        var sigUri = new Uri(CanonicalOrigin, $"signatures/v{manifest.Version}.sig");
        using var response = await _httpClient.GetAsync(sigUri, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsByteArrayAsync(cancellationToken);
    }

    public async Task FetchAndStageArtifactsAsync(
        UpdateManifest manifest,
        string stagingPath,
        IProgress<UpdateProgressReport>? progress = default,
        CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(stagingPath);

        int totalArtifacts = manifest.Artifacts.Count;
        int completedArtifacts = 0;

        foreach (var artifact in manifest.Artifacts)
        {
            var destinationFile = Path.Combine(stagingPath, artifact.RelativeFilePath);
            var parentDir = Path.GetDirectoryName(destinationFile);
            if (!string.IsNullOrEmpty(parentDir))
            {
                Directory.CreateDirectory(parentDir);
            }

            var artifactUri = new Uri(CanonicalOrigin, $"artifacts/v{manifest.Version}/{artifact.RelativeFilePath}");
            using var response = await _httpClient.GetAsync(artifactUri, cancellationToken);
            response.EnsureSuccessStatusCode();

            await using var remoteStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            await using var localStream = new FileStream(destinationFile, FileMode.Create, FileAccess.Write, FileShare.None);
            await remoteStream.CopyToAsync(localStream, cancellationToken);

            completedArtifacts++;
            var pct = (double)completedArtifacts / totalArtifacts * 100.0;
            progress?.Report(new UpdateProgressReport(pct, $"Staged {artifact.RelativeFilePath}", completedArtifacts, totalArtifacts));
        }
    }
}
