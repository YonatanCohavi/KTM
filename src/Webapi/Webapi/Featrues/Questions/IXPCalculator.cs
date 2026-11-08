namespace Webapi.Featrues.Questions;

public record struct LevelDetails(int Level, int CurrentLevelXp, int NextLevelXp);
public interface IXPCalculator
{
    LevelDetails GetLevelByXp(int xp);
}

public class XPCalculator : IXPCalculator
{
    public LevelDetails GetLevelByXp(int xp)
    {
        var safeXp = Math.Max(0, xp);
        var level = 1;
        var currentLevelXp = 0;
        var nextLevelXp = (int)Math.Floor(100 * Math.Pow(1.2, level - 1));

        while (safeXp >= nextLevelXp)
        {
            currentLevelXp = nextLevelXp;
            level++;
            nextLevelXp += (int)Math.Floor(100 * Math.Pow(1.2, level - 1));
        }

        return new LevelDetails(level, currentLevelXp, nextLevelXp);
    }

}
