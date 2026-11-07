using System.Collections.ObjectModel;
using Microsoft.Extensions.Caching.Memory;

namespace Webapi.Featrues.Members;

public class MemberSessionManager(IMemoryCache memoryCache) : IMemberSessionManager
{
    private const double _streakBonusPerQuestion = 0.05;
    private const int _baseValue = 10;
    private const int _streakCacheDurationMinutes = 60;

    private static readonly List<TimingMultiplierRule> _timingMultipliers =
    [
        new TimingMultiplierRule(2.0, 1.3),
        new TimingMultiplierRule(5.0, 1.15),
        new TimingMultiplierRule(30.0, 1.05),
    ];

    public int GetWrongPenelty() => _baseValue * -1;
    public int RegisterAnswer(string userId, bool isCorrect)
    {
        var streakKey = GetStreakCacheKey(userId);
        var currentStreak = memoryCache.Get<int>(streakKey);
        var nextStreak = isCorrect ? currentStreak + 1 : 0;

        memoryCache.Set(streakKey, nextStreak, new MemoryCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromMinutes(_streakCacheDurationMinutes)
        });

        return nextStreak;
    }

    public ReadOnlyCollection<TimingMultiplierRule> GetTimingMultipliers() => _timingMultipliers.AsReadOnly();

    public double CalculateQuestionReward(int streak, TimeSpan answerTime, int wrongGuessCount)
    {
        var streakBonusMultiplier = 1 + (streak * _streakBonusPerQuestion);
        var timeBonusMultiplier = CalculateTimeBonusMultiplier(answerTime);
        var wrongGuessPenaltyMultiplier = Math.Pow(0.7, Math.Max(0, wrongGuessCount));
        return _baseValue * streakBonusMultiplier * timeBonusMultiplier * wrongGuessPenaltyMultiplier;
    }

    private static string GetStreakCacheKey(string userId) => $"streak_{userId}";

    private static double CalculateTimeBonusMultiplier(TimeSpan answerTime)
    {
        var seconds = answerTime.TotalSeconds;
        foreach (var rule in _timingMultipliers)
        {
            if (seconds < rule.MaxSeconds)
                return rule.Multiplier;
        }

        return 1.0;
    }
}
