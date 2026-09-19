// -----------------------------------------------------------------------
// <copyright file="UpdateCheckpoint.cs" company="Cloud107">
// Copyright (c) Cloud107 contributors. All rights reserved.
// Licensed under the AGPL-3.0-or-later license.
// </copyright>
// -----------------------------------------------------------------------

namespace Cloud107.CLI.Updates;

/// <summary>
/// Represents an immutable point-in-time recovery checkpoint stored in /var/lib/cloud107/checkpoints/.
/// </summary>
public record UpdateCheckpoint(
    string CheckpointId,
    Version FromVersion,
    DateTimeOffset CreatedAt,
    string BackupDirectoryPath,
    IReadOnlyList<string> PreservedPaths,
    string DatabaseSnapshotPath,
    bool IsActive);

/// <summary>
/// Status and diagnostics returned by the 7-step update verification execution.
/// </summary>
public record UpdateExecutionResult(
    bool Success,
    Version TargetVersion,
    int StepsCompleted,
    string SummaryMessage,
    TimeSpan ElapsedDuration,
    UpdateCheckpoint? CreatedCheckpoint,
    bool DidRollback,
    Exception? Error);
