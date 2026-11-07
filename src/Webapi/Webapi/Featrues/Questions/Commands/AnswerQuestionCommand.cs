using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.Members;
using Webapi.Featrues.User;

namespace Webapi.Featrues.Questions.Commands;

public class AnswerQuestionCommandResponse
{
    public bool IsCorrect { get; set; }
    public UserStats UserStats { get; set; } = new UserStats();
}
public record AnswerQuestionCommand(Guid QuestionId, int AnsweredMemberId) : ICommand<AnswerQuestionCommandResponse>;
public class AnswerQuestionCommandHandler(
    IMemoryCache memoryCache,
    IBrowserWeightCache browserWeightCache,
    IMemberSessionManager memberSessionManager,
    ILeaderboardXpStore leaderboardXpStore,
    IXPCalculator xPCalculator) : ICommandHandler<AnswerQuestionCommand, AnswerQuestionCommandResponse>
{
    public async Task<AnswerQuestionCommandResponse> ExecuteAsync(AnswerQuestionCommand command, CancellationToken ct)
    {
        var cacheKey = CachedQuestion.CacheKey(command.QuestionId);
        var question = memoryCache.Get<CachedQuestion>(cacheKey)
            ?? throw new InvalidOperationException($"Question with ID {command.QuestionId} not found in cache");

        if (question.WrongAnswerCount >= 3)
        {
            var streak = memberSessionManager.RegisterAnswer(question.UserId, false);
            memoryCache.Remove(cacheKey);

            var penaltyXp = memberSessionManager.GetWrongPenelty();
            var xpAfterPenalty = await leaderboardXpStore.UpdateXpAsync(question.UserId, penaltyXp, ct);
            var currentLevel = xPCalculator.GetLevelByXp(xpAfterPenalty);

            return new AnswerQuestionCommandResponse
            {
                IsCorrect = false,
                UserStats = new UserStats
                {
                    Xp = xpAfterPenalty,
                    Level = currentLevel,
                    Streak = streak
                }
            };
        }

        var isCorrect = command.AnsweredMemberId == question.CorrectMemberId;
        await browserWeightCache.AdjustWeightAsync(question.UserId, command.AnsweredMemberId, isCorrect);

        var currentStreak = memberSessionManager.RegisterAnswer(question.UserId, isCorrect);
        int userXp;

        if (isCorrect)
        {
            memoryCache.Remove(cacheKey);
            var answerTime = DateTime.UtcNow - question.CreatedAt;
            var reward = memberSessionManager.CalculateQuestionReward(currentStreak, answerTime, question.WrongAnswerCount);
            var rewardXp = Math.Max(0, (int)Math.Round(reward));
            userXp = await leaderboardXpStore.UpdateXpAsync(question.UserId, rewardXp, ct);
        }
        else
        {
            var penaltyXp = memberSessionManager.GetWrongPenelty();
            userXp = await leaderboardXpStore.UpdateXpAsync(question.UserId, penaltyXp, ct);

            question.WrongAnswerCount++;
            memoryCache.Set(
                cacheKey,
                question,
                new MemoryCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromMinutes(5)
                });
        }

        var level = xPCalculator.GetLevelByXp(userXp);
        return new AnswerQuestionCommandResponse
        {
            IsCorrect = isCorrect,
            UserStats = new UserStats
            {
                Xp = userXp,
                Level = level,
                Streak = currentStreak
            }
        };
    }
}
