using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Common;
using Trebol.Web.Helpers;
using Trebol.Web.Hubs;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class CitasController(
    ICitaRepository citaRepo,
    ISaldoUsuarioRepository saldoRepo,
    IHubContext<CitaSalaHub> citaSalaHub) : Controller
{
    private const int TamanoPagina = 10;

    // GET /Citas/Index  — Vista del usuario (sus citas como paciente)
    [Authorize(Roles = "Usuario")]
    public async Task<IActionResult> Index(int paginaActivas = 1, int paginaPasadas = 1, CancellationToken ct = default)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        paginaActivas = Math.Max(1, paginaActivas);
        paginaPasadas = Math.Max(1, paginaPasadas);

        var totalActivas = await citaRepo.ContarActivasPorUsuarioAsync(usuarioId, ct);
        var totalPasadas = await citaRepo.ContarPasadasPorUsuarioAsync(usuarioId, ct);

        var vm = new MisCitasUsuarioVm
        {
            CitasActivas = await citaRepo.ObtenerActivasPorUsuarioAsync(usuarioId, paginaActivas, TamanoPagina, ct),
            CitasPasadas = await citaRepo.ObtenerPasadasPorUsuarioAsync(usuarioId, paginaPasadas, TamanoPagina, ct),
            PaginacionActivas = Paginacion("paginaActivas", paginaActivas, totalActivas),
            PaginacionPasadas = Paginacion("paginaPasadas", paginaPasadas, totalPasadas)
        };

        return View(vm);
    }

    private static PaginacionVm Paginacion(string param, int pagina, int total)
    {
        var totalPaginas = TamanoPagina > 0 ? (int)Math.Ceiling(total / (double)TamanoPagina) : 0;
        if (totalPaginas > 0 && pagina > totalPaginas)
            pagina = totalPaginas;

        return new PaginacionVm
        {
            Controller   = "Citas",
            Action       = "Index",
            PaginaActual = pagina,
            TamanoPagina = TamanoPagina,
            TotalRegistros = total,
            ParamPagina  = param
        };
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
        => RedirectToAction("SeleccionarTipo", "PagoCita", new { profesionalId, fechaHora, duracionMinutos = 60 });

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
        var cita = await ObtenerDetalleAutorizadoAsync(id);
        if (cita is null) return NotFound();
        return View(cita);
    }

    /// <summary>Sala de videollamada privada — usuario (sala-usuario.html).</summary>
    [Authorize(Roles = "Usuario")]
    [HttpGet]
    public async Task<IActionResult> SalaUsuario(int citaId, CancellationToken ct)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cita = await citaRepo.ObtenerParaSalaUsuarioAsync(citaId, usuarioId, ct);
        if (cita is null) return NotFound();

        if (!CitaSalaHelper.PuedeIngresar(cita.Estado, cita.FechaHora, cita.FechaHoraFin))
        {
            TempData["Error"] = cita.EsHoy
                ? CitaConstant.EstadoInvalidoSala
                : CitaConstant.SalaNoDisponible;
            return RedirectToAction(nameof(Index));
        }

        await saldoRepo.RegistrarIngresoCitaSalaAsync(citaId, "Usuario", usuarioId, ct);

        return View(cita);
    }

    [Authorize(Roles = "Usuario")]
    [HttpGet]
    public async Task<IActionResult> EvaluarInasistencia(int citaId, CancellationToken ct)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var eval = await saldoRepo.EvaluarInasistenciaCitaAsync(citaId, usuarioId, ct);
        if (!eval.RequiereModal || !eval.NovedadUsuarioId.HasValue)
            return Json(new { requiereModal = false });

        var novedad = await saldoRepo.ObtenerNovedadPendienteModalAsync(usuarioId, ct);
        return Json(new
        {
            requiereModal = true,
            novedad = novedad is null ? null : new
            {
                novedad.NovedadUsuarioId,
                novedad.TipoNovedad,
                novedad.Titulo,
                novedad.Mensaje,
                novedad.EsCita,
                novedad.ProfesionalId,
                novedad.TienePagoAprobado
            }
        });
    }

    [Authorize(Roles = "Profesional")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ReportarAusencia(int citaId, string? mensaje, CancellationToken ct)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await saldoRepo.ReportarAusenciaProfesionalAsync(citaId, profesionalId, mensaje, ct);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [Authorize(Roles = "Profesional")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegistrarIngresoProfesional(int citaId, CancellationToken ct)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cita = await citaRepo.ObtenerParaSalaProfesionalAsync(citaId, profesionalId, ct);
        if (cita is null)
            return Json(new { exito = false, mensaje = CitaConstant.CitaNoEncontrada });

        var resultado = await saldoRepo.RegistrarIngresoCitaSalaAsync(citaId, "Profesional", profesionalId, ct);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [Authorize(Roles = "Usuario")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ActualizarAliasCita(int citaId, bool mostrarAlias, CancellationToken ct)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cita = await citaRepo.ObtenerParaSalaUsuarioAsync(citaId, usuarioId, ct);
        if (cita is null)
            return Json(new { exito = false, mensaje = CitaConstant.CitaNoEncontrada });

        var resultado = await citaRepo.ActualizarMostrarAliasAsync(citaId, usuarioId, mostrarAlias, ct);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [Authorize(Roles = "Profesional")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> GuardarRecomendacion(int citaId, string contenido, CancellationToken ct)
    {
        var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await citaRepo.GuardarRecomendacionAsync(citaId, profesionalId, contenido, ct);
        if (resultado.Exito)
        {
            await citaSalaHub.Clients.Group(CitaSalaHub.GrupoCita(citaId))
                .SendAsync("RecomendacionActualizada", new
                {
                    contenido = (contenido ?? string.Empty).Trim(),
                    fecha = DateTime.UtcNow
                }, ct);
        }

        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [Authorize(Roles = "Usuario")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> GuardarNotaPrivada(int citaId, string contenido, CancellationToken ct)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cita = await citaRepo.ObtenerParaSalaUsuarioAsync(citaId, usuarioId, ct);
        if (cita is null)
            return Json(new { exito = false, mensaje = CitaConstant.CitaNoEncontrada });

        var resultado = await citaRepo.GuardarNotaPrivadaAsync(citaId, usuarioId, contenido, ct);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    [Authorize(Roles = "Usuario,Profesional")]
    [HttpGet]
    public async Task<IActionResult> MensajesSala(int citaId, CancellationToken ct)
    {
        if (!await PuedeAccederSalaCitaAsync(citaId, ct))
            return NotFound();

        var mensajes = await citaRepo.ListarMensajesCitaAsync(citaId, ct);
        return Json(mensajes.Select(m => new
        {
            alias = m.AliasRemitente,
            contenido = m.Contenido,
            enviadoEn = m.Fecha,
            remitenteTipo = m.RemitenteTipo
        }));
    }

    /// <summary>Fragmento HTML del detalle para modal (usuario dueño o profesional de la cita).</summary>
    [Authorize(Roles = "Usuario,Profesional")]
    [HttpGet]
    public async Task<IActionResult> DetalleModal(int id)
    {
        var cita = await ObtenerDetalleAutorizadoAsync(id);
        if (cita is null) return NotFound();

        return User.IsInRole("Profesional")
            ? PartialView("_DetalleCitaModalProfesional", cita)
            : PartialView("_DetalleCitaModalBody", cita);
    }

    private async Task<CitaListaDto?> ObtenerDetalleAutorizadoAsync(int citaId)
    {
        if (User.IsInRole("Usuario"))
        {
            var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return await citaRepo.ObtenerDetalleParaClienteAsync(citaId, usuarioId, null);
        }

        if (User.IsInRole("Profesional"))
        {
            var profesionalId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var enSala = await citaRepo.ObtenerParaSalaProfesionalAsync(citaId, profesionalId);
            if (enSala is null) return null;
            return await citaRepo.ObtenerDetalleAsync(citaId);
        }

        return await citaRepo.ObtenerDetalleAsync(citaId);
    }

    private async Task<bool> PuedeAccederSalaCitaAsync(int citaId, CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (User.IsInRole("Profesional"))
            return await citaRepo.ObtenerParaSalaProfesionalAsync(citaId, id, ct) is not null;

        return await citaRepo.ObtenerParaSalaUsuarioAsync(citaId, id, ct) is not null;
    }
}
