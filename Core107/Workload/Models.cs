namespace Core107.Workload;

public sealed record WorkloadRepresentation(
    WorkloadIdentity Identity,
    WorkloadOperation Operation,
    ResourceRequirement Resources,
    CapabilityRequirement Capabilities,
    IReadOnlyList<PlatformConstraint> Constraints,
    IReadOnlyList<Dependency> Dependencies,
    AuthorizationRequirements? AuthorizationRequirements
);

public sealed record WorkloadIdentity(
    string Id,
    string Name,
    string Version,
    Provenance Provenance
);

public sealed record Provenance(
    string Source,
    string? Signature,
    string Hash
);

public sealed record WorkloadOperation(
    string Entrypoint,
    IReadOnlyList<string>? Arguments,
    Dictionary<string, string>? Environment,
    string? WorkingDirectory
);

public sealed record ResourceRequirement(
    CpuRequirement? Cpu,
    MemoryRequirement? Memory,
    StorageRequirement? Storage
);

public sealed record CpuRequirement(double Cores, string Architecture);

public sealed record MemoryRequirement(long Minimum, long? Recommended);

public sealed record StorageRequirement(long Required);

public sealed record CapabilityRequirement(
    bool? Networking,
    FileSystemRequirement? FileSystem,
    IReadOnlyList<string>? Devices,
    IReadOnlyList<string>? SyscallGroups
);

public sealed record FileSystemRequirement(
    IReadOnlyList<string>? ReadOnly,
    IReadOnlyList<string>? ReadWrite
);

public sealed record PlatformConstraint(
    string Os,
    string? MinVersion,
    IReadOnlyList<string>? Architectures
);

public sealed record Dependency(
    string Name,
    string Version,
    string Type,
    string Resolution
);

public sealed record AuthorizationRequirements(
    string? RequiresPolicy,
    IReadOnlyList<string>? DeniedScopes
);

public sealed record NodeCapabilities(
    string NodeId,
    string Os,
    string Architecture,
    long AvailableMemory,
    double AvailableCores,
    NodeCapabilitySet Capabilities,
    IReadOnlyList<AvailableDependency> AvailableDependencies,
    IReadOnlyList<string> AuthorizationPolicies
);

public sealed record NodeCapabilitySet(
    bool Networking,
    Dictionary<string, string> FileSystemRoots,
    IReadOnlyList<string> Devices,
    IReadOnlyList<string> SyscallGroups
);

public sealed record AvailableDependency(
    string Name,
    string Version,
    string ResolvedTo
);

public sealed record ExecutionPlan(
    string WorkloadId,
    string NodeId,
    ResolvedResults Resolved,
    AuthorizationResult Authorization,
    bool Executable,
    string? ReasonNotExecutable,
    ExecutionSpec? Execution,
    string PlanId,
    long CreatedAt,
    long? ValidUntil,
    string? Signature
);

public sealed record ResolvedResults(
    IReadOnlyList<ResolvedDependency> Dependencies,
    CapabilityResolution Capabilities,
    ResourceResolution Resources
);

public sealed record ResolvedDependency(
    string Name,
    string Version,
    string ResolvedTo,
    bool Available
);

public sealed record CapabilityResolution(
    IReadOnlyList<string> Required,
    IReadOnlyList<string> Available,
    bool Satisfied
);

public sealed record ResourceResolution(
    long MemoryAvailable,
    long MemoryRequired,
    double CoresAvailable,
    double CoresRequired,
    bool Satisfied
);

public sealed record AuthorizationResult(
    IReadOnlyList<string>? RequiredPolicies,
    bool Authorized,
    string? Reason
);

public sealed record ExecutionSpec(
    string ExecutablePath,
    IReadOnlyList<string> Arguments,
    Dictionary<string, string> Environment,
    string WorkingDirectory,
    ExecutionConstraints Constraints
);

public sealed record ExecutionConstraints(
    long MemoryLimit,
    double CpuCores,
    long? TimeoutSeconds
);
