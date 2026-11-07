using System.Collections.ObjectModel;

namespace Webapi.Featrues.Members;

public interface IMemberSessionManager
{
    int RegisterAnswer(string userId, bool isCorrect);
    double CalculateQuestionReward(int streak, TimeSpan answerTime, int wrongGuessCount);
    ReadOnlyCollection<TimingMultiplierRule> GetTimingMultipliers();
    int GetWrongPenelty();
}

public record TimingMultiplierRule(double MaxSeconds, double Multiplier);
