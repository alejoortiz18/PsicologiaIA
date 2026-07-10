using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Enums;
using Trebol.Web.Helpers;
using Trebol.Model.DTOs.Pago;
using Trebol.Web.Hubs;
using Trebol.Web.Services;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Profesional")]
public class SalasController(
    ISalaRepository salaRepo,
    ICitaRepository citaRepo,
    ISaldoUsuarioRepository saldoRepo,
    IPagoSimuladoService pagoSimulado,
    IHubContext<ConferenciaHub> conferenciaHub) : Controller
{
    public async Task<IActionResult> Index()
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var salas         = await salaRepo.ObtenerPorProfesionalAsync(profesionalId);
        return View(salas);
    }

    [HttpGet]
    public IActionResult Nueva() => View(new CrearSalaDto());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Nueva(CrearSalaDto dto)
    {
        if (!ModelState.IsValid) return View(dto);
        dto.ProfesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado     = await salaRepo.CrearAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(dto);
        }
        TempData["Mensaje"] = SalaConstant.SalaCreada;
        return RedirectToAction("Index");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CrearAjax([FromForm] CrearSalaDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errores = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => e.ErrorMessage))
                .Distinct()
                .ToList();
            return Json(new { exito = false, mensaje = errores.FirstOrDefault() ?? "Datos inválidos.", errores });
        }

        dto.ProfesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await salaRepo.CrearAsync(dto);
        return Json(new
        {
            exito = resultado.Exito,
            mensaje = resultado.Exito ? SalaConstant.SalaCreada : resultado.Mensaje,
            salaId = resultado.Datos
        });
    }

    [HttpGet]
    public async Task<IActionResult> Editar(int id)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sala = await salaRepo.ObtenerParaEdicionAsync(id, profesionalId);
        if (sala is null)
        {
            TempData["Error"] = SalaConstant.SalaNoEncontrada;
            return RedirectToAction(nameof(Index));
        }

        var vm = new EditarSalaDto
        {
            SalaId         = sala.SalaId,
            ProfesionalId  = profesionalId,
            Titulo         = sala.Titulo,
            Descripcion    = sala.Descripcion,
            Tipo           = sala.Tipo,
            Capacidad      = sala.Capacidad,
            FechaInicio    = sala.FechaInicio,
            Precio         = sala.Precio
        };
        return View(vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Editar(EditarSalaDto dto)
    {
        if (!ModelState.IsValid) return View(dto);
        dto.ProfesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await salaRepo.ActualizarAsync(dto);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            return View(dto);
        }
        TempData["Mensaje"] = SalaConstant.SalaActualizada;
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Cerrar(int salaId)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await salaRepo.CerrarAsync(salaId, profesionalId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Eliminar(int salaId)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await salaRepo.EliminarAsync(salaId, profesionalId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [HttpGet]
    public async Task<IActionResult> Detalle(int id)
    {
        var sala = await salaRepo.ObtenerDetalleAsync(id);
        if (sala is null) return NotFound();
        return View(sala);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CancelarEvento(int salaId, string? motivo)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await saldoRepo.CancelarEventoSalaConNovedadesAsync(salaId, profesionalId, motivo);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    /// <summary>Sala de videollamada privada — profesional (sala-profesional.html).</summary>
    [HttpGet]
    public async Task<IActionResult> SalaPrivadaProfesional(int citaId)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cita = await citaRepo.ObtenerParaSalaProfesionalAsync(citaId, profesionalId);
        if (cita is null) return NotFound();

        if (!PuedeIngresarCita(cita))
        {
            TempData["Error"] = cita.EsHoy
                ? CitaConstant.EstadoInvalidoSala
                : CitaConstant.SalaNoDisponible;
            return RedirectToAction("Citas", "PerfilProfesional");
        }

        await saldoRepo.RegistrarIngresoCitaSalaAsync(citaId, "Profesional", profesionalId);

        return View(cita);
    }

    /// <summary>Sala de conferencia en vivo — moderador (sala-conferencia-profesional.html).</summary>
    [HttpGet]
    public async Task<IActionResult> SalaConferenciaProfesional(int id)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sala = await salaRepo.ObtenerConferenciaProfesionalAsync(id, profesionalId);
        if (sala is null) return NotFound();

        if (sala.Estado != EstadoSala.Abierta)
        {
            TempData["Error"] = SalaConstant.ConferenciaNoActiva;
            return RedirectToAction("Salas", "PerfilProfesional");
        }

        await salaRepo.RegistrarIngresoConferenciaAsync(id, "Profesional", profesionalId);
        await conferenciaHub.Clients.Group(ConferenciaHub.GrupoSala(id))
            .SendAsync("PonenteConectado", cancellationToken: HttpContext.RequestAborted);

        return View(sala);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> TerminarSesionCita(int citaId)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cita = await citaRepo.ObtenerParaSalaProfesionalAsync(citaId, profesionalId);
        if (cita is null)
            return Json(new { exito = false, mensaje = CitaConstant.CitaNoEncontrada });

        var resultado = await citaRepo.FinalizarAsync(citaId, profesionalId);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> FinalizarConferencia(int salaId)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sala = await salaRepo.ObtenerConferenciaProfesionalAsync(salaId, profesionalId);
        if (sala is null)
            return Json(new { exito = false, mensaje = SalaConstant.SinPermisoConferencia });

        var resultado = await salaRepo.CerrarAsync(salaId, profesionalId);
        return Json(new
        {
            exito = resultado.Exito,
            mensaje = resultado.Exito ? SalaConstant.SalaFinalizada : resultado.Mensaje,
            redirect = Url.Action("Index", "MisEventos")
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleChatSala(int salaId, bool habilitado)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await salaRepo.ToggleChatSalaAsync(salaId, profesionalId, habilitado);
        if (resultado.Exito)
        {
            await conferenciaHub.Clients
                .Group(ConferenciaHub.GrupoSala(salaId))
                .SendAsync("ChatEstadoActualizado", habilitado);
        }

        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ComprarMinutosExtension(int salaId, int minutos, TarjetaPagoDto tarjeta)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sala = await salaRepo.ObtenerConferenciaProfesionalAsync(salaId, profesionalId);
        if (sala is null)
            return Json(new { exito = false, mensaje = SalaConstant.SinPermisoConferencia });

        if (minutos < 3)
            return Json(new { exito = false, mensaje = SalaConstant.ExtensionMinimoMinutos });

        var validacion = pagoSimulado.ValidarPago(tarjeta);
        if (!validacion.Exito)
            return Json(new { exito = false, mensaje = validacion.Mensaje ?? SalaConstant.ExtensionRequiereTarjeta });

        var resultado = await salaRepo.ComprarMinutosExtensionAsync(
            salaId, profesionalId, minutos, tarjeta.MetodoPago, HttpContext.RequestAborted);

        if (resultado.Exito)
        {
            await conferenciaHub.Clients.Group(ConferenciaHub.GrupoSala(salaId))
                .SendAsync("TiempoConferenciaExtendido", new
                {
                    finEfectivo = resultado.FinEfectivo?.ToString("o"),
                    minutosExtra = resultado.MinutosExtra,
                    minutosComprados = minutos
                });
        }

        return Json(new
        {
            exito = resultado.Exito,
            mensaje = resultado.Mensaje,
            finEfectivo = resultado.FinEfectivo?.ToString("o"),
            minutosExtra = resultado.MinutosExtra
        });
    }

    private static bool PuedeIngresarCita(SalaCitaProfesionalDto cita)
        => CitaSalaHelper.PuedeIngresar(cita.Estado, cita.FechaHora, cita.FechaHoraFin);
}
