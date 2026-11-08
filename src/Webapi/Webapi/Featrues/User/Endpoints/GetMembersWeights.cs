using FastEndpoints;
using Webapi.Featrues.Fractions;
using Webapi.Featrues.Knesset.Dto;
using Webapi.Featrues.Members.Queries;

namespace Webapi.Featrues.User.Endpoints;

public record GetMembersWeightsRequest(string UserId);
public class GetMembersWeights : Endpoint<GetMembersWeightsRequest, Dictionary<int, double>>
{
    public override void Configure()
    {
        Get("/user/{UserId}/weights");
    }

    public override async Task<Dictionary<int, double>> ExecuteAsync(GetMembersWeightsRequest request, CancellationToken ct)
    {
        var members = await new GetMembersWeightsQuery(request.UserId).ExecuteAsync(ct);
        return members;
    }
}
