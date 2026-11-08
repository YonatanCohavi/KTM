using FastEndpoints;
using Webapi.Featrues.User.Queries;

namespace Webapi.Featrues.User.Endpoints;

public record GetStatsRequest(string UserId);
public class GetStats : Endpoint<GetStatsRequest, UserStats>
{
    public override void Configure()
    {
        Get("/user/{UserId}/stats");
    }

    public override Task<UserStats> ExecuteAsync(GetStatsRequest req, CancellationToken ct)
    {
        return new GetUserStatsQuery(req.UserId).ExecuteAsync(ct);
    }
}
