using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Webapi.Featrues.DB.Supabase;

[Table("leaderboard")]
public class LeaderboardEntry : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("browser_uuid")]
    public string BrowserUuid { get; set; } = string.Empty;

    [Column("player_name")]
    public string PlayerName { get; set; } = string.Empty;

    [Column("level")]
    public int Level { get; set; } = 1;

    [Column("xp")]
    public int Xp { get; set; }

    [Column("max_streak")]
    public int MaxStreak { get; set; }
    [Column("streak")]
    public int Streak { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
