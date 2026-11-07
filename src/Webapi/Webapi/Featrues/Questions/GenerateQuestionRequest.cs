namespace Webapi.Featrues.Questions;

public class MemberWeight
{
    public int Id { get; set; }
    public double Weight { get; set; }
}

public class GenerateQuestionRequest
{
    /// <summary>
    /// Browser UUID for tracking user weights server-side
    /// </summary>
    public required string BrowserId { get; set; }
    
    /// <summary>
    /// Member IDs to exclude from question generation
    /// </summary>
    public int[]? Exclude { get; set; }
    
    /// <summary>
    /// Optional: Send weights only on first request or when changed significantly.
    /// Server caches by BrowserId after receiving them once.
    /// </summary>
    public MemberWeight[]? Weights { get; set; }
}
