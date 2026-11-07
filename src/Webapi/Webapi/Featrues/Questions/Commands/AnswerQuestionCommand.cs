using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;

namespace Webapi.Featrues.Questions.Commands;

public record AnswerQuestionCommand(Guid QuestionId, int AnsweredMemberId) : ICommand<bool>;
public class AnswerQuestionCommandHandler(IMemoryCache memoryCache, IBrowserWeightCache browserWeightCache) : ICommandHandler<AnswerQuestionCommand, bool>
{
    public async Task<bool> ExecuteAsync(AnswerQuestionCommand command, CancellationToken ct)
    {
        var question = memoryCache.Get<CachedQuestion>(CachedQuestion.CacheKey(command.QuestionId))
            ?? throw new InvalidOperationException($"Question with ID {command.QuestionId} not found in cache");

        var iscorrect = command.AnsweredMemberId == question.CorrectMemberId;
        await browserWeightCache.AdjustWeightAsync("development", command.AnsweredMemberId, iscorrect);
        if (iscorrect)
            memoryCache.Remove(CachedQuestion.CacheKey(command.QuestionId));


        return iscorrect;
    }
}
