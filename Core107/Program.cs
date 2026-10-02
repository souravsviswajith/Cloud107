using Core107.Workload;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ExecutionPlanner>();
builder.WebHost.UseUrls("http://0.0.0.0:5107");

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/plan", (PlanRequest request, ExecutionPlanner planner) =>
{
    var plan = planner.PlanWorkload(request.Workload, request.Node);
    return Results.Ok(plan);
});

app.Run();

public sealed record PlanRequest(
    WorkloadRepresentation Workload,
    NodeCapabilities Node
);
