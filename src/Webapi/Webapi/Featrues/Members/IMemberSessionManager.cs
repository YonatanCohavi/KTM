using System.Collections.ObjectModel;

namespace Webapi.Featrues.Members;

public interface IMemberSessionManager
{
    double CalculateQuestionReward(int streak, TimeSpan answerTime);
    ReadOnlyCollection<TimingMultiplierRule> GetTimingMultipliers();
}

public record TimingMultiplierRule(double MaxSeconds, double Multiplier);
public class MemberSessionManager : IMemberSessionManager
{
    private const double _streakBonusPerQuestion = 0.05;
    private const int _baseValue = 10;
    private List<TimingMultiplierRule> TimingMultipliers { get; set; } =
    [
        new TimingMultiplierRule(2.0, 1.3),
        new TimingMultiplierRule(5.0, 1.15),
        new TimingMultiplierRule(30.0, 1.05),
    ];
    public ReadOnlyCollection<TimingMultiplierRule> GetTimingMultipliers() => TimingMultipliers.AsReadOnly();
    public double CalculateQuestionReward(int streak, TimeSpan answerTime)
    {
        var streakBonusMultiplier = 1 + (streak * _streakBonusPerQuestion);
        var timeBonusMultiplier = CalculateTimeBonusMultiplier(answerTime);
        return _baseValue * streakBonusMultiplier * timeBonusMultiplier;
    }

    private double CalculateTimeBonusMultiplier(TimeSpan answerTime)
    {
        var seconds = answerTime.TotalSeconds;
        foreach (var rule in TimingMultipliers)
        {
            if (seconds < rule.MaxSeconds)
                return rule.Multiplier;
        }
        return 1.0; 
    }
}
