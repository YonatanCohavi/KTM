using FastEndpoints;
using Microsoft.AspNetCore.Mvc;
using Webapi.Featrues.Questions.Commands;
using Webapi.Featrues.User;

namespace Webapi.Featrues.Questions.Endpoints;

public record struct AnswerQuestionResponse(bool IsCorrect, UserStats UserStats);
public record AnswerQuestionRequest(Guid QuestionId, int MemberId);
public class AnswerQuestion : Endpoint<AnswerQuestionRequest, AnswerQuestionResponse>
{
    public override void Configure()
    {
        Get("/question/{QuestionId}/answer");
    }

    public override async Task<AnswerQuestionResponse> ExecuteAsync(AnswerQuestionRequest req, CancellationToken ct)
    {
        var result = await new AnswerQuestionCommand(req.QuestionId, req.MemberId).ExecuteAsync(ct);
        return new AnswerQuestionResponse(result.IsCorrect, result.UserStats);
    }
}
