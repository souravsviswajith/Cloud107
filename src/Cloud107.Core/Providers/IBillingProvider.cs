// -----------------------------------------------------------------------
// <copyright file="IBillingProvider.cs" company="Cloud107">
// Copyright (c) Cloud107 contributors. All rights reserved.
// Licensed under the AGPL-3.0-or-later license.
// </copyright>
// -----------------------------------------------------------------------

namespace Cloud107.Core.Providers;

/// <summary>
/// Provider-neutral billing and cost telemetry contract.
/// Billing sources remain isolated from the Cloud107 control plane so the UI
/// can consume live cost data without hardcoding a cloud vendor or pricing model.
/// </summary>
public interface IBillingProvider
{
    /// <summary>
    /// Gets the unique billing provider identifier.
    /// </summary>
    string ProviderId { get; }

    /// <summary>
    /// Gets the human-readable billing provider name.
    /// </summary>
    string DisplayName { get; }

    /// <summary>
    /// Gets the current billing snapshot for the requested scope.
    /// </summary>
    Task<BillingSnapshot> GetSnapshotAsync(
        BillingQuery query,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Scope and time range for a live billing query.
/// </summary>
public record BillingQuery(
    DateTimeOffset From,
    DateTimeOffset To,
    string? NodeId = null,
    string? WorkspaceId = null);

/// <summary>
/// Authoritative billing data returned by a provider.
/// Amounts are never inferred from resource utilization by Cloud107.
/// </summary>
public record BillingSnapshot(
    string ProviderId,
    string Currency,
    decimal TotalAmount,
    DateTimeOffset From,
    DateTimeOffset To,
    DateTimeOffset SampledAt,
    IReadOnlyList<BillingLineItem> Items);

/// <summary>
/// A provider-reported cost component.
/// </summary>
public record BillingLineItem(
    string ResourceId,
    string ResourceType,
    string Description,
    decimal Amount,
    string Currency,
    DateTimeOffset From,
    DateTimeOffset To);
