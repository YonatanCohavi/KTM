using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.Members;

namespace Webapi.Featrues.Questions.Commands;

public record AnswerQuestionCommand(Guid UserId, Guid QuestionId, int AnsweredMemberId) : ICommand<bool>;
public class AnswerQuestionCommandHandler(IMemoryCache memoryCache, IBrowserWeightCache browserWeightCache,IMemberSessionManager memberSessionManager) : ICommandHandler<AnswerQuestionCommand, bool>
{
    public async Task<bool> ExecuteAsync(AnswerQuestionCommand command, CancellationToken ct)
    {
        var question = memoryCache.Get<CachedQuestion>(CachedQuestion.CacheKey(command.QuestionId))
            ?? throw new InvalidOperationException($"Question with ID {command.QuestionId} not found in cache");

        var iscorrect = command.AnsweredMemberId == question.CorrectMemberId;
        await browserWeightCache.AdjustWeightAsync("development", command.AnsweredMemberId, iscorrect);
        if (iscorrect)
        {
            memoryCache.Remove(CachedQuestion.CacheKey(command.QuestionId));
            var answerTime = DateTime.UtcNow - question.CreatedAt;
            var reward = memberSessionManager.CalculateQuestionReward(question.Streak, answerTime);

        }


        return iscorrect;
    }
}
