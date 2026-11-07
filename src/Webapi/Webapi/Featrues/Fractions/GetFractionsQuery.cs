using FastEndpoints;
using Webapi.Featrues.Fractions.Endpoints;
using Webapi.Featrues.Knesset;
using Webapi.Featrues.Knesset.Dto;

namespace Webapi.Featrues.Fractions;

public record struct GetFractionsQuery() : ICommand<Faction[]>;
public class GetFractionsQueryHandler(IKnessetAPI knessetAPI) : ICommandHandler<GetFractionsQuery, Faction[]>
{
    public async Task<Faction[]> ExecuteAsync(GetFractionsQuery command, CancellationToken ct)
    {
        return await knessetAPI.GetFactionsAsync(ct);
    }

}
