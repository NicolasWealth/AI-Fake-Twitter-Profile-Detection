using System.Collections.Generic;

namespace FakeProfileDetection.Backend.Models
{
    public class ScanRequest
    {
        public string Url { get; set; }
        public string Title { get; set; }
        public int Forms { get; set; }
        public List<string> Links { get; set; }
        public string UserId { get; set; }
    }

    public class ScanResult
    {
        public double RiskScore { get; set; }
        public bool IsPhishing { get; set; }
    }
}
