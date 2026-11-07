using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Webapi.Featrues.Knesset;

public class KnessetapiHealth(IKnessetAPI knessetAPI) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var isHealthy = await knessetAPI.HealthCheckAsync(cancellationToken);
        return isHealthy ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy();
    }
}
