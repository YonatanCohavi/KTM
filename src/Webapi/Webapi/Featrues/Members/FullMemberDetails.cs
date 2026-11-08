namespace Webapi.Featrues.Members;

public class FullMemberDetails
{
    public int MkId { get; set; }
    public int FactionId { get; set; }
    public string FactionName { get; set; } = string.Empty;
    public string Firstname { get; set; } = string.Empty;
    public string Lastname { get; set; } = string.Empty;
    public int GenderId { get; set; }
}
