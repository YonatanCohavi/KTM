using FastEndpoints;
using Webapi.Featrues.Users.Queries;

namespace Webapi.Featrues.Users.Endpoints;

public class GetLeadersBoard : EndpointWithoutRequest<LeaderBoardMember[]>
{
    public override void Configure()
    {
        Get("/user/leaderboard");
    }

    public override Task<LeaderBoardMember[]> ExecuteAsync(CancellationToken ct)
    {
        return new GetLeaderBoardMembersQuery().ExecuteAsync(ct);
    }
}
