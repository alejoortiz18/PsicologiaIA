using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Cita;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class CitasController(ICitaRepository citaRepo) : Controller
{
    // GET /Citas/Index  — Vista del usuario (sus citas como paciente)
    [Authorize(Roles = "Usuario")]
    public async Task<IActionResult> Index(string estado = "Todos", int pagina = 1)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var citas     = await citaRepo.ObtenerPorUsuarioAsync(usuarioId, estado, pagina);
        return View(citas);
    }

    [Authorize(Roles = "Profesional")]
    public IActionResult ListaProfesional(string estado = "Todos", int pagina = 1)
    {
        return RedirectToAction("Citas", "PerfilProfesional", new { estado });
    }

    // GET /Citas/NuevaCita?profesionalId=5
    [Authorize(Roles = "Usuario")]
    [HttpGet]
    public IActionResult NuevaCita(int profesionalId, DateTime? fechaHora)
        => RedirectToAction("Confirmar", "PagoCita", new { profesionalId, fechaHora, duracionMinutos = 60 });

    // POST /Citas/NuevaCita
    [Authorize(Roles = "Usuario")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> NuevaCita(CrearCitaDto dto)
    {
        if (!ModelState.IsValid) return View(dto);

        dto.UsuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await citaRepo.AgendarAsync(dto);

        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(dto);
        }

        TempData["Mensaje"] = CitaConstant.CitaAgendada;
        return RedirectToAction("Index");
    }

    // POST /Citas/Cancelar
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Cancelar(int citaId)
    {
        var solicitanteId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado     = await citaRepo.CancelarAsync(citaId, solicitanteId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    // GET /Citas/Detalle/5
    public async Task<IActionResult> Detalle(int id)
    {
        var cita = await citaRepo.ObtenerDetalleAsync(id);
        if (cita is null) return NotFound();
        return View(cita);
    }
}
