using FastEndpoints;
using Webapi.Featrues.Questions;

namespace Webapi.Featrues.Members.Queries;

public record GetMembersWeightsQuery(string UserId) : ICommand<Dictionary<int,double>>;
public class GetMembersWeightsQueryHandler(IBrowserWeightCache browserWeightCache) : ICommandHandler<GetMembersWeightsQuery, Dictionary<int,double>>
{
    public async Task<Dictionary<int,double>> ExecuteAsync(GetMembersWeightsQuery query, CancellationToken ct)
    {
        var weights = await browserWeightCache.GetWeightsAsync(query.UserId, ct);
        return weights.ToDictionary(w => w.MemberId, w => w.Knowlage);
    }
}