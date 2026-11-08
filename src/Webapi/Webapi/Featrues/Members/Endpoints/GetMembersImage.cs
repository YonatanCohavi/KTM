using FastEndpoints;
using System.Security.Cryptography.X509Certificates;
using Webapi.Featrues.Fractions;
using Webapi.Featrues.Knesset.Dto;
using Webapi.Featrues.Members.Queries;

namespace Webapi.Featrues.Members.Endpoints;


public record GetMembersImageRequest(int MemberId);
public class GetMembersImage : Endpoint<GetMembersImageRequest>
{
    public override void Configure()
    {
        Get("/member/{MemberId}/image");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetMembersImageRequest req, CancellationToken ct)
    {
        var fileStream = await new GetMemberImageQuery(req.MemberId).ExecuteAsync(ct);
        HttpContext.Response.Headers.CacheControl = "public, max-age=3600";
        await Send.StreamAsync(fileStream, contentType: "image/jpeg", cancellation: ct);
    }
}
