using FastEndpoints;
using Webapi.Featrues.Knesset;
using Webapi.Featrues.Knesset.Dto;

namespace Webapi.Featrues.Members.Queries;

public record struct GetMembersQuery() : ICommand<KnessentMember[]>;
public class GetMembersQueryHandler(IKnessetAPI knessetAPI) : ICommandHandler<GetMembersQuery, KnessentMember[]>
{
    public async Task<KnessentMember[]> ExecuteAsync(GetMembersQuery command, CancellationToken ct)
    {
        return await knessetAPI.GetKnessetMembersAsync(ct);
    }
}
