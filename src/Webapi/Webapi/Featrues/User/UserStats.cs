using Webapi.Featrues.Questions;

namespace Webapi.Featrues.User;

public class UserStats
{
    public string Name { get; set; } = string.Empty;
    public LevelDetails Level { get; set; }
    public int Xp { get; set; }
    public int Streak { get; set; }
}
