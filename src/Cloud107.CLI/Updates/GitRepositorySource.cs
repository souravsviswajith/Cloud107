// -----------------------------------------------------------------------
// <copyright file="GitRepositorySource.cs" company="Cloud107">
// Copyright (c) Cloud107 contributors. All rights reserved.
// Licensed under the AGPL-3.0-or-later license.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.Json;

namespace Cloud107.CLI.Updates;

/// <summary>
/// Interchangeable Git source provider implementation for source-first deployments.
/// Treats Git as an interchangeable source provider rather than a hardcoded shell call.
/// </summary>
public sealed class GitRepositorySource : IUpdateSource
{
    private readonly HttpClient _httpClient;

    public string SourceScheme => "git";
    public Uri CanonicalOrigin { get; }

    public GitRepositorySource(Uri canonicalOrigin, HttpClient? httpClient = null)
    {
        CanonicalOrigin = canonicalOrigin ?? throw new ArgumentNullException(nameof(canonicalOrigin));
        _httpClient = httpClient ?? new HttpClient();
    }

    public async Task<UpdateManifest?> DiscoverUpdateAsync(
        Version currentVersion,
        string targetChannel,
        CancellationToken cancellationToken = default)
    {
        // Query remote repository tag/release metadata via HTTPS API or raw manifest
        var manifestUri = new Uri(CanonicalOrigin, $"releases/{targetChannel}/manifest.json");
        
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
        var sigUri = new Uri(CanonicalOrigin, $"releases/v{manifest.Version}/manifest.json.sig");
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

        var archiveUri = new Uri(CanonicalOrigin, $"releases/v{manifest.Version}/cloud107-v{manifest.Version}-source.tar.gz");
        using var response = await _httpClient.GetAsync(archiveUri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();

        var totalBytes = response.Content.Headers.ContentLength ?? 0L;
        var destinationArchive = Path.Combine(stagingPath, "source.tar.gz");

        await using (var remoteStream = await response.Content.ReadAsStreamAsync(cancellationToken))
        await using (var fileStream = new FileStream(destinationArchive, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            var buffer = new byte[81920];
            long bytesReadTotal = 0;
            int bytesRead;

            while ((bytesRead = await remoteStream.ReadAsync(buffer, 0, buffer.Length, cancellationToken)) > 0)
            {
                await fileStream.WriteAsync(buffer.AsMemory(0, bytesRead), cancellationToken);
                bytesReadTotal += bytesRead;

                var pct = totalBytes > 0 ? (double)bytesReadTotal / totalBytes * 100.0 : 0.0;
                progress?.Report(new UpdateProgressReport(pct, "Fetching source archive", bytesReadTotal, totalBytes));
            }
        }

        progress?.Report(new UpdateProgressReport(100.0, "Source archive staged successfully", totalBytes, totalBytes));
    }
}
