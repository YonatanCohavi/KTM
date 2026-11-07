
using FastEndpoints;
using Webapi.Featrues.Knesset;

namespace Webapi.Featrues.Members.Queries;

public record struct GetMemberImageQuery(int MemberId) : ICommand<Stream>;
public class GetMemberImageQueryHandler(IKnessetAPI knessetAPI) : ICommandHandler<GetMemberImageQuery, Stream>
{
    public async Task<Stream> ExecuteAsync(GetMemberImageQuery command, CancellationToken ct)
    {
        return await knessetAPI.GetMemberImageAsync(command.MemberId, ct);
    }
}

