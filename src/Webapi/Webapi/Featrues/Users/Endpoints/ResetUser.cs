using FastEndpoints;
using Webapi.Featrues.Users.Commands;

namespace Webapi.Featrues.Users.Endpoints;


public record ResetUserRequest(string UserId);
public class ResetUser: Endpoint<ResetUserRequest>
{
    public override void Configure()
    {
        Patch("/user/{UserId}/reset");
    }

    public override async Task HandleAsync(ResetUserRequest req, CancellationToken ct)
    {
        await new ResetUserCommand(req.UserId).ExecuteAsync(ct);
        await Send.OkAsync(cancellation: ct);
    }
}
