namespace Core107.Workload;

public sealed class ExecutionPlanner
{
    public ExecutionPlan PlanWorkload(
        WorkloadRepresentation workload,
        NodeCapabilities node)
    {
        var requiredCapabilities = ResolveCapabilities(workload, node);
        var resources = ResolveResources(workload, node);
        var dependencies = ResolveDependencies(workload, node);
        var authorization = CheckAuthorization(workload, node);
        var platformCompatible = IsPlatformCompatible(workload, node);

        var executable =
            platformCompatible &&
            requiredCapabilities.Satisfied &&
            resources.Satisfied &&
            dependencies.All(d => d.Available) &&
            authorization.Authorized;

        var reason = executable
            ? null
            : BuildFailureReason(
                platformCompatible,
                requiredCapabilities,
                resources,
                dependencies,
                authorization);

        var execution = executable
            ? BuildExecutionSpec(workload, resources)
            : null;

        return new ExecutionPlan(
            workload.Identity.Id,
            node.NodeId,
            new ResolvedResults(dependencies, requiredCapabilities, resources),
            authorization,
            executable,
            reason,
            execution,
            Guid.NewGuid().ToString("N"),
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            null,
            null);
    }

    private static bool IsPlatformCompatible(
        WorkloadRepresentation workload,
        NodeCapabilities node)
    {
        return workload.Constraints.Count == 0 ||
            workload.Constraints.Any(c =>
                string.Equals(c.Os, node.Os, StringComparison.OrdinalIgnoreCase) &&
                (c.Architectures is null ||
                 c.Architectures.Count == 0 ||
                 c.Architectures.Contains(node.Architecture, StringComparer.OrdinalIgnoreCase)));
    }

    private static CapabilityResolution ResolveCapabilities(
        WorkloadRepresentation workload,
        NodeCapabilities node)
    {
        var required = new List<string>();
        var available = new List<string>();

        if (workload.Capabilities.Networking == true)
        {
            required.Add("networking");
            if (node.Capabilities.Networking)
                available.Add("networking");
        }

        foreach (var device in workload.Capabilities.Devices ?? [])
        {
            var capability = $"device:{device}";
            required.Add(capability);
            if (node.Capabilities.Devices.Contains(device, StringComparer.Ordinal))
                available.Add(capability);
        }

        foreach (var syscallGroup in workload.Capabilities.SyscallGroups ?? [])
        {
            var capability = $"syscall:{syscallGroup}";
            required.Add(capability);
            if (node.Capabilities.SyscallGroups.Contains(syscallGroup, StringComparer.Ordinal))
                available.Add(capability);
        }

        foreach (var path in workload.Capabilities.FileSystem?.ReadOnly ?? [])
        {
            var capability = $"filesystem:ro:{path}";
            required.Add(capability);
            if (HasFileSystemAccess(node.Capabilities.FileSystemRoots, path, readWrite: false))
                available.Add(capability);
        }

        foreach (var path in workload.Capabilities.FileSystem?.ReadWrite ?? [])
        {
            var capability = $"filesystem:rw:{path}";
            required.Add(capability);
            if (HasFileSystemAccess(node.Capabilities.FileSystemRoots, path, readWrite: true))
                available.Add(capability);
        }

        return new CapabilityResolution(
            required,
            available,
            required.All(available.Contains));
    }

    private static bool HasFileSystemAccess(
        Dictionary<string, string> roots,
        string path,
        bool readWrite)
    {
        foreach (var root in roots)
        {
            if (!path.StartsWith(root.Key, StringComparison.Ordinal))
                continue;

            if (!readWrite || root.Value.Equals("rw", StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }

    private static ResourceResolution ResolveResources(
        WorkloadRepresentation workload,
        NodeCapabilities node)
    {
        var memoryRequired = workload.Resources.Memory?.Minimum ?? 0;
        var coresRequired = workload.Resources.Cpu?.Cores ?? 0;

        return new ResourceResolution(
            node.AvailableMemory,
            memoryRequired,
            node.AvailableCores,
            coresRequired,
            node.AvailableMemory >= memoryRequired &&
            node.AvailableCores >= coresRequired);
    }

    private static IReadOnlyList<ResolvedDependency> ResolveDependencies(
        WorkloadRepresentation workload,
        NodeCapabilities node)
    {
        return workload.Dependencies
            .Select(dependency =>
            {
                var available = node.AvailableDependencies.FirstOrDefault(
                    candidate =>
                        candidate.Name == dependency.Name &&
                        candidate.Version == dependency.Version);

                return new ResolvedDependency(
                    dependency.Name,
                    dependency.Version,
                    available?.ResolvedTo ?? string.Empty,
                    available is not null);
            })
            .ToArray();
    }

    private static AuthorizationResult CheckAuthorization(
        WorkloadRepresentation workload,
        NodeCapabilities node)
    {
        var requiredPolicies = workload.AuthorizationRequirements?.RequiresPolicy is { } policy
            ? new[] { policy }
            : Array.Empty<string>();

        if (workload.AuthorizationRequirements?.DeniedScopes?.Count > 0)
        {
            return new AuthorizationResult(
                requiredPolicies,
                false,
                "Workload contains denied authorization scopes.");
        }

        if (requiredPolicies.Any(policy => !node.AuthorizationPolicies.Contains(policy, StringComparer.Ordinal)))
        {
            return new AuthorizationResult(
                requiredPolicies,
                false,
                "Required authorization policy is not available on the target node.");
        }

        return new AuthorizationResult(requiredPolicies, true, null);
    }

    private static ExecutionSpec BuildExecutionSpec(
        WorkloadRepresentation workload,
        ResourceResolution resources)
    {
        return new ExecutionSpec(
            workload.Operation.Entrypoint,
            workload.Operation.Arguments ?? [],
            workload.Operation.Environment ?? new Dictionary<string, string>(),
            workload.Operation.WorkingDirectory ?? "/",
            new ExecutionConstraints(
                workload.Resources.Memory?.Recommended ?? resources.MemoryRequired,
                workload.Resources.Cpu?.Cores ?? resources.CoresAvailable,
                null));
    }

    private static string BuildFailureReason(
        bool platformCompatible,
        CapabilityResolution capabilities,
        ResourceResolution resources,
        IReadOnlyList<ResolvedDependency> dependencies,
        AuthorizationResult authorization)
    {
        if (!platformCompatible)
            return "Platform or architecture constraint is not satisfied.";
        if (!capabilities.Satisfied)
            return "Required capabilities are not available.";
        if (!resources.Satisfied)
            return "Required resources are not available.";
        if (dependencies.Any(d => !d.Available))
            return "Required dependency is not available.";
        if (!authorization.Authorized)
            return authorization.Reason ?? "Authorization failed.";
        return "Execution requirements are not satisfied.";
    }
}
