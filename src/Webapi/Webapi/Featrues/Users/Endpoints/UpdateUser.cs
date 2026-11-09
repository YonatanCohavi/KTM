using FastEndpoints;
using Webapi.Featrues.Users.Commands;

namespace Webapi.Featrues.Users.Endpoints;

public record UpdateUserRequest(string UserId,string? Name);
public class UpdateUser : Endpoint<UpdateUserRequest>
{
    public override void Configure()
    {
        Patch("/user/{UserId}");
    }

    public override async Task HandleAsync(UpdateUserRequest req, CancellationToken ct)
    {
        await new UpdateUserCommand(req.UserId, req.Name).ExecuteAsync(ct);
        await Send.OkAsync(cancellation: ct);
    }
}
