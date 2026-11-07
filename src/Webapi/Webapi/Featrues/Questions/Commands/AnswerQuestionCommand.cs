using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.Members;

namespace Webapi.Featrues.Questions.Commands;

public record AnswerQuestionCommand(Guid QuestionId, int AnsweredMemberId) : ICommand<bool>;
public class AnswerQuestionCommandHandler(IMemoryCache memoryCache, IBrowserWeightCache browserWeightCache, IMemberSessionManager memberSessionManager) : ICommandHandler<AnswerQuestionCommand, bool>
{
    public async Task<bool> ExecuteAsync(AnswerQuestionCommand command, CancellationToken ct)
    {
        var question = memoryCache.Get<CachedQuestion>(CachedQuestion.CacheKey(command.QuestionId))
            ?? throw new InvalidOperationException($"Question with ID {command.QuestionId} not found in cache");

        if (question.WrongAnswerCount >= 3)
        {
            memberSessionManager.RegisterAnswer(question.UserId, false);
            memoryCache.Remove(CachedQuestion.CacheKey(command.QuestionId));
            return false;
        }

        var isCorrect = command.AnsweredMemberId == question.CorrectMemberId;
        await browserWeightCache.AdjustWeightAsync(question.UserId, command.AnsweredMemberId, isCorrect);

        var streak = memberSessionManager.RegisterAnswer(question.UserId, isCorrect);

        if (isCorrect)
        {
            memoryCache.Remove(CachedQuestion.CacheKey(command.QuestionId));
            var answerTime = DateTime.UtcNow - question.CreatedAt;
            _ = memberSessionManager.CalculateQuestionReward(streak, answerTime, question.WrongAnswerCount);
        }
        else
        {
            question.WrongAnswerCount++;
            memoryCache.Set(
                CachedQuestion.CacheKey(command.QuestionId),
                question,
                new MemoryCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromMinutes(5)
                });
        }

        return isCorrect;
    }
}
