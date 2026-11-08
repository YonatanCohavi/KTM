namespace Webapi.Featrues.Knesset.Dto;

public class KnessentMember
{
    public int MkId { get; set; }
    public int FactionId { get; set; }
    public string ImagePath { get; set; } = string.Empty;
    public string Firstname { get; set; } = string.Empty;
    public string Lastname { get; set; } = string.Empty;
    public int GenderId { get; set; }
}


