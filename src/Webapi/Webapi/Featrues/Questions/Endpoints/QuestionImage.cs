using FastEndpoints;
using Webapi.Featrues.Fractions;
using Webapi.Featrues.Knesset.Dto;
using Webapi.Featrues.Members.Queries;
using Webapi.Featrues.Questions.Queries;

namespace Webapi.Featrues.Members.Endpoints;

public record GetQuestionImageRequest(Guid QuestionId, int? OptionIndex = null);
public class OptionImage : Endpoint<GetQuestionImageRequest>
{
    public override void Configure()
    {
        Get("/question/{QuestionId}/image");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetQuestionImageRequest req, CancellationToken ct)
    {
        var fileStream = await new GetQuestionImageQuery(req.QuestionId, req.OptionIndex).ExecuteAsync(ct);
        HttpContext.Response.Headers.CacheControl = "public, max-age=3600";
        await Send.StreamAsync(fileStream, contentType: "image/jpeg", cancellation: ct);
    }
}
