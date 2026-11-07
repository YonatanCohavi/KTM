namespace Webapi.Featrues.Questions;

public record  struct LevelDetails(int Level, int CurrentLevelXp, int NextLevelXp);
public interface IXPCalculator
{
    LevelDetails GetLevelByXp(int xp);
    //LevelDetails GetLevelDetails(int level);
}

public class XPCalculator : IXPCalculator
{
    public LevelDetails GetLevelByXp(int xp)
    {
        var total = 0;
        var level = 1;
        while (xp > total)
        {
            var levelXp = (int)Math.Floor(100 * Math.Pow(1.2, level - 1));
            total += levelXp;
            level++;
        }
        var nextLevelXp = (int)Math.Floor(100 * Math.Pow(1.2, level));
        return new LevelDetails(level, total, nextLevelXp);
    }
    public LevelDetails GetLevelDetails(int level)
    {
        var total = 0;
        for (int i = 1; i < level; i++)
        {
            var levelXp = (int)Math.Floor(100 * Math.Pow(1.2, i - 1));
            total += levelXp;
        }
        var nextLevelXp = (int)Math.Floor(100 * Math.Pow(1.2, level));
        return new LevelDetails(level, total, nextLevelXp);
    }
}
