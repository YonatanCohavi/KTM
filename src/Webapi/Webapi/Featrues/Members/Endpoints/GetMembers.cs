using FastEndpoints;
using Webapi.Featrues.Fractions;
using Webapi.Featrues.Knesset.Dto;
using Webapi.Featrues.Members.Queries;

namespace Webapi.Featrues.Members.Endpoints;
public class GetMembers : EndpointWithoutRequest<FullMemberDetails[]>
{
    public override void Configure()
    {
        Get("/members");
    }

    public override async Task<FullMemberDetails[]> ExecuteAsync(CancellationToken ct)
    {
        var members = await new GetMembersQuery().ExecuteAsync(ct);
        return members;
    }
}
