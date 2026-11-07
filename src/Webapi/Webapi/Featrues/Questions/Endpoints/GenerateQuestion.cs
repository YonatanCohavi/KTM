using FastEndpoints;
using Webapi.Featrues.Questions.Commands;

namespace Webapi.Featrues.Questions.Endpoints;

public record struct GenerateQuestionResponse(QuizQuestion Question);
public record GenerateQuestionRequest(string BrowserId);
public class GenerateQuestion : Endpoint<GenerateQuestionRequest, GenerateQuestionResponse>
{
    public override void Configure()
    {
        Post("/question/next");
    }

    public override async Task<GenerateQuestionResponse> ExecuteAsync(GenerateQuestionRequest req, CancellationToken ct)
    {
        var question = await new GenerateQuestionCommand(req.BrowserId).ExecuteAsync(ct);
        return new GenerateQuestionResponse(question);
    }
}
