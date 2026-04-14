using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FakeProfileDetection.Backend.Models;
using FakeProfileDetection.Backend.Services;

namespace FakeProfileDetection.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScanController : ControllerBase
    {
        private readonly IScannerService _scannerService;

        public ScanController(IScannerService scannerService)
        {
            _scannerService = scannerService;
        }

        [HttpPost("scan")]
        public async Task<IActionResult> Scan([FromBody] ScanRequest req)
        {
            var result = await _scannerService.Analyze(req);
            return Ok(result);
        }
    }
}
