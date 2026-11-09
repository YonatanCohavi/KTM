using Webapi.Featrues.Questions;

namespace Webapi.Featrues.Users;

public class LeaderBoardMember  
{
    public required string UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
    public int MaxStreak { get; set; }
    public int Streak { get; set; }
    public int Xp { get; set; }
}
public class UserStats
{
    public string Name { get; set; } = string.Empty;
    public LevelDetails Level { get; set; }
    public int CurrentLevelXp { get; set; }
    public int Streak { get; set; }
}
