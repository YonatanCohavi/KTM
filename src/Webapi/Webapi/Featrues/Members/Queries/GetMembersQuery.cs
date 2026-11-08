using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.Knesset;
using Webapi.Featrues.Knesset.Dto;
using Webapi.Featrues.Members.Endpoints;

namespace Webapi.Featrues.Members.Queries;

public record struct GetMembersQuery() : ICommand<FullMemberDetails[]>;
public class GetMembersQueryHandler(IKnessetAPI knessetAPI, IMemoryCache memoryCache) : ICommandHandler<GetMembersQuery, FullMemberDetails[]>
{
    public async Task<FullMemberDetails[]> ExecuteAsync(GetMembersQuery command, CancellationToken ct)
    {
        return await memoryCache.GetOrCreateAsync("full_members", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            var members = await knessetAPI.GetKnessetMembersAsync(ct);
            var fractions = await knessetAPI.GetFactionsAsync(ct);

            var fractionsById = fractions.ToDictionary(f => f.Id, f => f.Name);
            return members.Select(m => new FullMemberDetails
            {
                MkId = m.MkId,
                FactionId = m.FactionId,
                FactionName = fractionsById.GetValueOrDefault(m.FactionId, string.Empty),
                Firstname = m.Firstname,
                Lastname = m.Lastname,
                GenderId = m.GenderId
            }).ToArray();
        }) ?? [];

    }
}
