using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Webapi.Featrues.DB.Supabase;

[Table("browser_weights")]
public class BrowserWeight : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = string.Empty;

    [Column("browser_uuid")]
    public string BrowserUuid { get; set; } = string.Empty;

    [Column("member_weights")]
    public MemberWeight[] MemberWeights { get; set; } = [];
}

public class MemberWeight
{
    public int MemberId { get; set; }
    public double Knowlage { get; set; }
}