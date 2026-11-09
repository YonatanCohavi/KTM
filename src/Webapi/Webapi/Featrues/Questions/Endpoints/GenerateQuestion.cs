using FastEndpoints;
using Webapi.Featrues.Questions.Commands;

namespace Webapi.Featrues.Questions.Endpoints;

public class ResponseQuizQuestion
{
    public Guid Id { get; set; }
    public required QuestionOption[] Options { get; set; }
}
public record struct GenerateQuestionResponse(ResponseQuizQuestion Question);
public record GenerateQuestionRequest(string BrowserId, Guid? PrevQuestionId);
public class GenerateQuestion : Endpoint<GenerateQuestionRequest, GenerateQuestionResponse>
{
    public override void Configure()
    {
        Post("/question/next");
    }

    public override async Task<GenerateQuestionResponse> ExecuteAsync(GenerateQuestionRequest req, CancellationToken ct)
    {
        var question = await new GenerateQuestionCommand(req.BrowserId, req.PrevQuestionId).ExecuteAsync(ct);
        return new GenerateQuestionResponse(new ResponseQuizQuestion
        {
            Id = question.Id,
            Options = question.Options
        });
    }
}
