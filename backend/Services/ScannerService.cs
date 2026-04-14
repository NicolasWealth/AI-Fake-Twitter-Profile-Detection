using System.Threading.Tasks;
using FakeProfileDetection.Backend.Models;

namespace FakeProfileDetection.Backend.Services
{
    public interface IScannerService
    {
        Task<ScanResult> Analyze(ScanRequest req);
    }

    public class ScannerService : IScannerService
    {
        private readonly IAIService _aiService;

        public ScannerService(IAIService aiService)
        {
            _aiService = aiService;
        }

        public async Task<ScanResult> Analyze(ScanRequest req)
        {
            return await _aiService.Process(req);
        }
    }

    public interface IAIService
    {
        Task<ScanResult> Process(ScanRequest req);
    }
}
