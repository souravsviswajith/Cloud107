using Xunit;

namespace Core107.Workload.Tests;

public sealed class ExecutionPlannerTests
{
    private readonly ExecutionPlanner _planner = new();

    [Fact]
    public void HelloLinux_IsExecutable()
    {
        var workload = HelloLinux();
        var node = Node(
            os: "linux",
            architecture: "x86_64",
            memory: 1_000_000_000,
            cores: 2);

        var plan = _planner.PlanWorkload(workload, node);

        Assert.True(plan.Executable);
        Assert.Equal("/bin/echo", plan.Execution!.ExecutablePath);
    }

    [Fact]
    public void ArchitectureMismatch_IsNotExecutable()
    {
        var plan = _planner.PlanWorkload(
            HelloLinux(),
            Node("linux", "arm64", 1_000_000_000, 2));

        Assert.False(plan.Executable);
        Assert.Contains("architecture", plan.ReasonNotExecutable!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ResourceShortage_IsNotExecutable()
    {
        var workload = HelloLinux() with
        {
            Resources = new ResourceRequirement(
                null,
                new MemoryRequirement(4_000_000_000, null),
                null)
        };

        var plan = _planner.PlanWorkload(
            workload,
            Node("linux", "x86_64", 2_000_000_000, 2));

        Assert.False(plan.Executable);
        Assert.Contains("resources", plan.ReasonNotExecutable!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void MissingDependency_IsNotExecutable()
    {
        var workload = HelloLinux() with
        {
            Dependencies =
            [
                new Dependency("libfoo", "1.2", "library", "system")
            ]
        };

        var plan = _planner.PlanWorkload(
            workload,
            Node("linux", "x86_64", 1_000_000_000, 2));

        Assert.False(plan.Executable);
        Assert.Contains("dependency", plan.ReasonNotExecutable!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void UnauthorizedWorkload_IsNotExecutable()
    {
        var workload = HelloLinux() with
        {
            AuthorizationRequirements =
                new AuthorizationRequirements("admin", null)
        };

        var plan = _planner.PlanWorkload(
            workload,
            Node("linux", "x86_64", 1_000_000_000, 2, policies: ["user"]));

        Assert.False(plan.Executable);
        Assert.Contains("authorization", plan.ReasonNotExecutable!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void MultipleDependencies_AllAvailable_IsExecutable()
    {
        var workload = HelloLinux() with
        {
            Dependencies =
            [
                new Dependency("libA", "1.0", "library", "system"),
                new Dependency("libB", "2.0", "library", "system")
            ]
        };

        var node = Node(
            "linux",
            "x86_64",
            1_000_000_000,
            2,
            dependencies:
            [
                new AvailableDependency("libA", "1.0", "system"),
                new AvailableDependency("libB", "2.0", "system")
            ]);

        var plan = _planner.PlanWorkload(workload, node);

        Assert.True(plan.Executable);
    }

    private static WorkloadRepresentation HelloLinux() =>
        new(
            new WorkloadIdentity(
                "hello-linux-1.0.0",
                "hello-linux",
                "1.0.0",
                new Provenance(
                    "test-suite",
                    null,
                    "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")),
            new WorkloadOperation("/bin/echo", ["Hello from Cloud107"], null, null),
            new ResourceRequirement(null, new MemoryRequirement(1_000_000, null), null),
            new CapabilityRequirement(null, null, null, null),
            [new PlatformConstraint("linux", null, ["x86_64"])],
            [],
            null);

    private static NodeCapabilities Node(
        string os,
        string architecture,
        long memory,
        double cores,
        IReadOnlyList<string>? policies = null,
        IReadOnlyList<AvailableDependency>? dependencies = null) =>
        new(
            "node-test",
            os,
            architecture,
            memory,
            cores,
            new NodeCapabilitySet(
                false,
                new Dictionary<string, string> { ["/"] = "ro" },
                [],
                []),
            dependencies ?? [],
            policies ?? []);
}
