using FastEndpoints;
using Webapi.Featrues.Knesset.Dto;

namespace Webapi.Featrues.Fractions.Endpoints;

public class GetFractions : EndpointWithoutRequest<Faction[]>
{
    public override void Configure()
    {
        Get("/faction");
        ResponseCache(3600);
    }

    public override async Task<Faction[]> ExecuteAsync(CancellationToken ct)
    {
        return await new GetFractionsQuery().ExecuteAsync(ct);
    }
}
