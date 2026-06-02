using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class ConferenciaController(ISalaRepository salaRepo) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Asistente(int id)
    {
        var p = InscripcionParticipante.From(User);
        var sala = await salaRepo.ObtenerConferenciaAsistenteAsync(
            id, p.UsuarioId, p.ProfesionalInscriptorId, HttpContext.RequestAborted);
        if (sala is null)
        {
            TempData["Error"] = SalaConstant.IngresoNoInscrito;
            return RedirectToAction("Index", "Eventos");
        }

        var estado = EventoIngresoHelper.EvaluarIngreso(
            esInscrito: true,
            sala.FechaInicio,
            sala.FechaFin,
            sala.Estado.ToString());

        if (estado == EstadoIngresoEvento.EventoFinalizado)
        {
            TempData["Error"] = SalaConstant.IngresoEventoFinalizado;
            return RedirectToAction("Index", User.IsInRole("Profesional") ? "MisEventos" : "Eventos");
        }

        if (estado == EstadoIngresoEvento.MuyTemprano)
        {
            TempData["Error"] = SalaConstant.IngresoMuyTemprano;
            return RedirectToAction("Index", User.IsInRole("Profesional") ? "MisEventos" : "Eventos");
        }

        return View(sala);
    }
}
