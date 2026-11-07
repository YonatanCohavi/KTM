using FastEndpoints;
using Webapi.Featrues.Settings.Queries;

namespace Webapi.Featrues.Settings.Endpoints;

public class GetSettings : EndpointWithoutRequest<GetSettingsResponse>
{
    public override void Configure()
    {
        Get("/settings");
    }
    public override async Task<GetSettingsResponse> ExecuteAsync(CancellationToken ct)
    {
        return await new GetGameSettingsQuery().ExecuteAsync(ct);
    }
}
