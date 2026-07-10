using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Web.Helpers;
using Trebol.Web.Hubs;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class ConferenciaController(
    ISalaRepository salaRepo,
    ISaldoUsuarioRepository saldoRepo,
    IHubContext<ConferenciaHub> conferenciaHub) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Asistente(int id, CancellationToken ct)
    {
        var p = InscripcionParticipante.From(User);
        var sala = await salaRepo.ObtenerConferenciaAsistenteAsync(
            id, p.UsuarioId, p.ProfesionalInscriptorId, ct);
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

        if (p.UsuarioId.HasValue)
            await salaRepo.RegistrarIngresoConferenciaAsync(id, "Usuario", p.UsuarioId.Value, ct);

        return View(sala);
    }

    [Authorize(Roles = "Usuario")]
    [HttpGet]
    public async Task<IActionResult> EvaluarInasistencia(int salaId, CancellationToken ct)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var eval = await salaRepo.EvaluarInasistenciaConferenciaAsync(salaId, usuarioId, ct);
        if (eval.ProfesionalPresente)
            return Json(new { requiereModal = false, profesionalPresente = true });

        if (!eval.RequiereModal || !eval.NovedadUsuarioId.HasValue)
            return Json(new { requiereModal = false, profesionalPresente = false });

        var novedad = await saldoRepo.ObtenerNovedadPendienteModalAsync(usuarioId, ct);
        return Json(new
        {
            requiereModal = true,
            profesionalPresente = false,
            novedad = novedad is null ? null : new
            {
                novedad.NovedadUsuarioId,
                novedad.TipoNovedad,
                novedad.Titulo,
                novedad.Mensaje,
                novedad.EsEvento,
                novedad.ProfesionalId,
                novedad.TienePagoAprobado
            }
        });
    }

    [HttpGet]
    public async Task<IActionResult> PresenciaProfesional(int salaId, CancellationToken ct)
    {
        var presencia = await salaRepo.ConsultarPresenciaProfesionalAsync(salaId, ct);
        return Json(new { profesionalPresente = presencia.ProfesionalPresente });
    }

    [HttpGet]
    public async Task<IActionResult> EstadoTiempo(int salaId, CancellationToken ct)
    {
        var estado = await salaRepo.ObtenerEstadoTiempoConferenciaAsync(salaId, ct);
        if (estado is null)
            return Json(new { fase = "Cerrada" });

        if (estado.Fase == "Cerrada")
        {
            await conferenciaHub.Clients.Group(ConferenciaHub.GrupoSala(salaId))
                .SendAsync("SalaCerradaPorTiempo", new
                {
                    estado.ProfesionalId,
                    estado.NombreProfesional,
                    mensaje = SalaConstant.SalaCerradaPorTiempo
                }, ct);
        }
        else if (estado.Fase == "GraciaChat")
        {
            await conferenciaHub.Clients.Group(ConferenciaHub.GrupoSala(salaId))
                .SendAsync("FaseConferenciaCambio", new { fase = estado.Fase, estado.SegundosRestantesGracia }, ct);
        }

        return Json(new
        {
            fase = estado.Fase,
            finEfectivo = estado.FinEfectivo?.ToString("o"),
            minutosExtra = estado.MinutosExtra,
            valorMinuto = estado.ValorMinuto,
            segundosRestantesGracia = estado.SegundosRestantesGracia,
            profesionalId = estado.ProfesionalId,
            nombreProfesional = estado.NombreProfesional
        });
    }
}
