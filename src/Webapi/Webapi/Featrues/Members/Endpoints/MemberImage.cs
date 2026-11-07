using FastEndpoints;
using Webapi.Featrues.Fractions;
using Webapi.Featrues.Knesset.Dto;
using Webapi.Featrues.Members.Queries;

namespace Webapi.Featrues.Members.Endpoints;

public class GetMembers : EndpointWithoutRequest<KnessentMember[]>
{
    public override void Configure()
    {
        Get("/members");
        ResponseCache(3600);
    }

    public override async Task<KnessentMember[]> ExecuteAsync(CancellationToken ct)
    {
        return await new GetMembersQuery().ExecuteAsync(ct);
    }
}
