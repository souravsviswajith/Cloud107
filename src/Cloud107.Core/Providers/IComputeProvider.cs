// -----------------------------------------------------------------------
// <copyright file="IComputeProvider.cs" company="Cloud107">
// Copyright (c) Cloud107 contributors. All rights reserved.
// Licensed under the AGPL-3.0-or-later license.
// </copyright>
// -----------------------------------------------------------------------

namespace Cloud107.Core.Providers;

/// <summary>
/// Sovereign compute provider interface abstracting physical host execution,
/// local virtualization (KVM/Hyper-V), container runtimes (Podman), and remote clouds.
/// Core does NOT hardcode Terraform, GCP, or hypervisors; providers implement this contract.
/// </summary>
public interface IComputeProvider
{
    /// <summary>
    /// Gets the unique identifier for the provider implementation (e.g. "local-kvm", "windows-hyperv", "gcp-isolated").
    /// </summary>
    string ProviderId { get; }

    /// <summary>
    /// Gets the human-readable display name.
    /// </summary>
    string DisplayName { get; }

    /// <summary>
    /// Gets the operational capabilities and supported features of this provider.
    /// </summary>
    ProviderCapabilities Capabilities { get; }

    /// <summary>
    /// Validates whether the host environment meets the prerequisites for this provider.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Validation result detailing prerequisite checks.</returns>
    Task<ProviderHealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Provisions a new compute node according to the specified configuration.
    /// </summary>
    /// <param name="spec">Specification describing vCPUs, RAM, storage, and networking.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Newly allocated compute node instance.</returns>
    Task<ComputeNodeInstance> ProvisionNodeAsync(
        NodeProvisioningSpecification spec,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Powers on or activates a previously provisioned node.
    /// </summary>
    /// <param name="nodeId">Unique identifier of the target node.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<NodeOperationResult> StartNodeAsync(string nodeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gracefully stops or pauses an active compute node.
    /// </summary>
    /// <param name="nodeId">Unique identifier of the target node.</param>
    /// <param name="force">If true, issues an immediate hard power-off.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<NodeOperationResult> StopNodeAsync(string nodeId, bool force = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deprovisions and reclaims all resources associated with a compute node.
    /// </summary>
    /// <param name="nodeId">Unique identifier of the target node.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<NodeOperationResult> TerminateNodeAsync(string nodeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves current state, IP addresses, and telemetry for a specific node.
    /// </summary>
    /// <param name="nodeId">Unique identifier of the target node.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<ComputeNodeInstance> GetNodeAsync(string nodeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lists all active and inactive nodes managed by this provider instance.
    /// </summary>
    /// <param name="filter">Optional query filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<IReadOnlyList<ComputeNodeInstance>> ListNodesAsync(
        NodeQueryFilter? filter = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Attaches an isolated network bridge, overlay (WireGuard/OVS), or port forwarding to the node.
    /// </summary>
    /// <param name="nodeId">Target node.</param>
    /// <param name="networkSpec">Network attachment parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<NetworkAttachmentResult> AttachNetworkAsync(
        string nodeId,
        NetworkAttachmentSpec networkSpec,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves live CPU, memory, and I/O utilization metrics for the node.
    /// </summary>
    /// <param name="nodeId">Target node.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<NodePerformanceMetrics> GetMetricsAsync(string nodeId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Operational capabilities exposed by a compute provider.
/// </summary>
public record ProviderCapabilities(
    bool SupportsHardwareGpuPassthrough,
    bool SupportsLiveMigration,
    bool SupportsNestedVirtualization,
    bool SupportsEphemeralSnapshots,
    IReadOnlyList<string> SupportedGuestOperatingSystems,
    IReadOnlyList<string> SupportedArchitectures);

/// <summary>
/// Specification describing the compute requirements for node allocation.
/// </summary>
public record NodeProvisioningSpecification(
    string Name,
    int VirtualCpuCount,
    long MemoryBytes,
    long DiskSizeBytes,
    string BaseImageUri,
    string GuestOs,
    IReadOnlyDictionary<string, string> Tags,
    IReadOnlyDictionary<string, string> EnvironmentVariables);

/// <summary>
/// State and runtime metadata for a compute node instance.
/// </summary>
public record ComputeNodeInstance(
    string NodeId,
    string ProviderId,
    string Name,
    NodeState State,
    int VirtualCpuCount,
    long MemoryBytes,
    string? PrimaryIpAddress,
    DateTimeOffset CreatedAt,
    DateTimeOffset? StartedAt,
    IReadOnlyDictionary<string, string> Metadata);

/// <summary>
/// Lifecycle states for compute nodes.
/// </summary>
public enum NodeState
{
    Pending,
    Provisioning,
    Running,
    Stopping,
    Stopped,
    Terminating,
    Terminated,
    Error
}

/// <summary>
/// Result of an asynchronous node operation.
/// </summary>
public record NodeOperationResult(
    string NodeId,
    bool Success,
    NodeState ResultingState,
    string? Message,
    TimeSpan Duration);

/// <summary>
/// Provider self-health and prerequisite verification result.
/// </summary>
public record ProviderHealthCheckResult(
    bool IsHealthy,
    string StatusMessage,
    IReadOnlyDictionary<string, bool> SubsystemChecks);

/// <summary>
/// Network attachment specification.
/// </summary>
public record NetworkAttachmentSpec(
    string NetworkType,
    string SubnetCidr,
    bool EnableNat,
    int? AssignedPort);

/// <summary>
/// Result of network attachment.
/// </summary>
public record NetworkAttachmentResult(
    bool Success,
    string InterfaceId,
    string AssignedIpAddress,
    int? MappedPort);

/// <summary>
/// Performance and resource telemetry.
/// </summary>
public record NodePerformanceMetrics(
    string NodeId,
    double CpuUsagePercentage,
    long MemoryUsedBytes,
    long MemoryTotalBytes,
    double DiskReadBytesPerSec,
    double DiskWriteBytesPerSec,
    double NetworkRxBytesPerSec,
    double NetworkTxBytesPerSec,
    DateTimeOffset SampledAt);

/// <summary>
/// Query filter for querying node inventories.
/// </summary>
public record NodeQueryFilter(
    NodeState? StateFilter,
    string? TagFilterKey,
    string? TagFilterValue);
