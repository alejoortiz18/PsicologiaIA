using Microsoft.AspNetCore.Mvc;

namespace Trebol.Web.Controllers;

public class LandingController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
