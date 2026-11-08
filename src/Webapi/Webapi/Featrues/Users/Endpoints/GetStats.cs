using FastEndpoints;
using Webapi.Featrues.Users.Queries;

namespace Webapi.Featrues.Users.Endpoints;

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
