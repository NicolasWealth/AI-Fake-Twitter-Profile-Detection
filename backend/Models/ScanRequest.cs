using System.Collections.Generic;

namespace FakeProfileDetection.Backend.Models
{
    public class ScanRequest
    {
        public string Username { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public int PostsCount { get; set; }
        public string UserId { get; set; }
    }

    public class ScanResult
    {
        public double RiskScore { get; set; }
        public bool IsFake { get; set; }
    }
}
