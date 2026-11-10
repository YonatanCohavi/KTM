using System.Collections.ObjectModel;

namespace Webapi.Featrues.Members;

public interface IMemberSessionManager
{
    Task<int> RegisterAnswerAsync(string userId, bool isCorrect, CancellationToken ct = default);
    double CalculateQuestionReward(int streak, TimeSpan answerTime, int wrongGuessCount);
    ReadOnlyCollection<TimingMultiplierRule> GetTimingMultipliers();
    int GetWrongPenelty();
}

public record TimingMultiplierRule(double MaxSeconds, double Multiplier);
