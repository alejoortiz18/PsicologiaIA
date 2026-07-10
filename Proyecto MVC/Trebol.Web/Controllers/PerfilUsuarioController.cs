using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Common;
using Trebol.Model.DTOs.Usuario;
using Trebol.Model.Entities.TrebolEntities;
using Trebol.Web.Helpers;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class PerfilUsuarioController(
    IUsuarioRepository usuarioRepo,
    ICitaRepository citaRepo,
    ISaldoUsuarioRepository saldoRepo) : Controller
{
    private const int TamanoPaginaEventos = 7;
    private const int TamanoPaginaPagos   = 10;
    private const int TamanoPaginaNovedades = 10;
    private const int LimiteCitasProximas = 10;

    private static readonly JsonSerializerOptions JsonCamel = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task<IActionResult> Index(
        int paginaEventos = 1,
        int paginaPagos = 1,
        int paginaNovedades = 1,
        DateTime? fechaDesde = null,
        DateTime? fechaHasta = null,
        string? tab = null,
        CancellationToken ct = default)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await usuarioRepo.ObtenerPorIdAsync(id, ct);
        if (user is null) return NotFound();

        var vm = await ConstruirViewModelAsync(
            user, paginaEventos, paginaPagos, paginaNovedades, fechaDesde, fechaHasta, ct);
        vm.MensajeExito = TempData["Mensaje"] as string;
        ViewBag.TabActiva = ResolverTab(tab, paginaEventos);
        return View(vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Actualizar(ActualizarUsuarioDto dto, CancellationToken ct = default)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var existente = await usuarioRepo.ObtenerPorIdAsync(id, ct);
        if (existente is null) return NotFound();

        dto.UsuarioId       = id;
        dto.NombreCompleto  = existente.NombreCompleto;
        dto.FechaNacimiento = existente.FechaNacimiento;
        dto.CiudadId        = existente.CiudadId;

        if (string.IsNullOrWhiteSpace(dto.Alias))
            ModelState.AddModelError(nameof(dto.Alias), "El alias es obligatorio.");
        if (string.IsNullOrWhiteSpace(dto.Celular))
            ModelState.AddModelError(nameof(dto.Celular), "El celular es obligatorio.");

        if (!ModelState.IsValid)
        {
            existente.Alias   = dto.Alias;
            existente.Celular = dto.Celular;
            var vm = await ConstruirViewModelAsync(existente, 1, 1, 1, null, null, ct);
            ViewBag.TabActiva = "cuenta";
            return View("Index", vm);
        }

        var resultado = await usuarioRepo.ActualizarAsync(dto, ct);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            existente.Alias   = dto.Alias;
            existente.Celular = dto.Celular;
            var vm = await ConstruirViewModelAsync(existente, 1, 1, 1, null, null, ct);
            ViewBag.TabActiva = "cuenta";
            return View("Index", vm);
        }

        TempData["Mensaje"] = PerfilConstant.PerfilActualizado;
        return RedirectToAction(nameof(Index), new { tab = "cuenta" });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> GuardarCuentaBancaria(
        GuardarCuentaBancariaUsuarioDto dto, CancellationToken ct = default)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (string.IsNullOrWhiteSpace(dto.Banco)
            || string.IsNullOrWhiteSpace(dto.TipoCuenta)
            || string.IsNullOrWhiteSpace(dto.NumeroCuenta)
            || string.IsNullOrWhiteSpace(dto.Titular))
        {
            TempData["Error"] = SaldoConstant.CuentaBancariaIncompleta;
            return RedirectToAction(nameof(Index), new { tab = "cuenta" });
        }

        var resultado = await saldoRepo.GuardarCuentaBancariaAsync(id, dto, ct);
        TempData[resultado.Exito ? "Mensaje" : "Error"] = resultado.Mensaje;
        return RedirectToAction(nameof(Index), new { tab = "cuenta" });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SolicitarRetiro(CancellationToken ct = default)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cuenta = await saldoRepo.ObtenerCuentaBancariaAsync(id, ct);
        if (cuenta is null || !cuenta.EstaCompleta)
        {
            return Json(new { exito = false, mensaje = SaldoConstant.RetiroSinCuenta });
        }

        var resultado = await saldoRepo.SolicitarRetiroAsync(id, null, ct);
        return Json(new
        {
            exito = resultado.Exito,
            mensaje = resultado.Mensaje,
            montoBruto = resultado.MontoBruto,
            comision = resultado.Comision,
            montoNeto = resultado.MontoNeto
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RetractarRetiro(int movimientoId, CancellationToken ct = default)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await saldoRepo.RetractarRetiroAsync(id, movimientoId, ct);
        return Json(new { exito = resultado.Exito, mensaje = resultado.Mensaje });
    }

    private static string ResolverTab(string? tab, int paginaEventos) => tab switch
    {
        "citas" or "agenda"  => "citas",
        "eventos"            => "eventos",
        "saldos"             => "saldos",
        "novedades"          => "novedades",
        _                    => paginaEventos > 1 ? "eventos" : "cuenta"
    };

    private async Task<PerfilUsuarioViewModel> ConstruirViewModelAsync(
        Usuario user,
        int paginaEventos,
        int paginaPagos,
        int paginaNovedades,
        DateTime? fechaDesde,
        DateTime? fechaHasta,
        CancellationToken ct)
    {
        paginaEventos    = Math.Max(1, paginaEventos);
        paginaPagos      = Math.Max(1, paginaPagos);
        paginaNovedades  = Math.Max(1, paginaNovedades);

        var totalEventos = await usuarioRepo.ContarEventosInscritosPerfilAsync(user.UsuarioId, ct);
        var totalPaginasEventos = TamanoPaginaEventos > 0
            ? (int)Math.Ceiling(totalEventos / (double)TamanoPaginaEventos)
            : 0;
        if (totalPaginasEventos > 0 && paginaEventos > totalPaginasEventos)
            paginaEventos = totalPaginasEventos;

        var filtro = new MisSaldosFiltroDto
        {
            FechaDesde  = fechaDesde,
            FechaHasta  = fechaHasta,
            PaginaPagos = paginaPagos
        };

        var pagosPorProf = await saldoRepo.ObtenerPagosPorProfesionalAsync(
            user.UsuarioId, filtro, TamanoPaginaPagos, ct);
        var totalPagos = pagosPorProf.FirstOrDefault()?.TotalRegistros ?? 0;
        var totalPaginasPagos = TamanoPaginaPagos > 0
            ? (int)Math.Ceiling(totalPagos / (double)TamanoPaginaPagos)
            : 0;
        if (totalPaginasPagos > 0 && paginaPagos > totalPaginasPagos)
            paginaPagos = totalPaginasPagos;

        var novedades = await saldoRepo.ObtenerNovedadesAsync(
            user.UsuarioId, "Pendiente", paginaNovedades, TamanoPaginaNovedades, ct);
        var totalNovedades = novedades.FirstOrDefault()?.TotalRegistros ?? 0;
        var totalPaginasNovedades = TamanoPaginaNovedades > 0
            ? (int)Math.Ceiling(totalNovedades / (double)TamanoPaginaNovedades)
            : 0;
        if (totalPaginasNovedades > 0 && paginaNovedades > totalPaginasNovedades)
            paginaNovedades = totalPaginasNovedades;

        var desde = DateTime.Today.AddMonths(-3);
        var hasta = DateTime.Today.AddMonths(6);
        var slotsCalendario = CalendarioSlotPresentacion.Formatear(
            await citaRepo.ObtenerSlotsCalendarioUsuarioAsync(user.UsuarioId, desde, hasta, ct),
            CalendarioSlotPresentacion.ModoVista.Usuario);

        return new PerfilUsuarioViewModel
        {
            Usuario = user,
            EventosInscritos = await usuarioRepo.ObtenerEventosInscritosPerfilAsync(
                user.UsuarioId, paginaEventos, TamanoPaginaEventos, ct),
            CitasProximas = await citaRepo.ObtenerProximasPorUsuarioAsync(
                user.UsuarioId, LimiteCitasProximas, ct),
            CitasCalendarioJson = JsonSerializer.Serialize(slotsCalendario, JsonCamel),
            PaginacionEventos = new PaginacionVm
            {
                Controller     = "PerfilUsuario",
                Action         = "Index",
                PaginaActual   = paginaEventos,
                TamanoPagina   = TamanoPaginaEventos,
                TotalRegistros = totalEventos
            },
            ResumenSaldos = await saldoRepo.ObtenerResumenAsync(user.UsuarioId, filtro, ct),
            PagosPorProfesional = pagosPorProf,
            MovimientosEnTransito = await saldoRepo.ObtenerMovimientosEnTransitoAsync(user.UsuarioId, ct),
            FiltroSaldos = filtro,
            ComisionRetiroPorcentaje = await saldoRepo.ObtenerComisionRetiroPorcentajeAsync(ct),
            CuentaBancaria = await saldoRepo.ObtenerCuentaBancariaAsync(user.UsuarioId, ct),
            Novedades = novedades,
            TotalNovedadesPendientes = await saldoRepo.ContarNovedadesPendientesAsync(user.UsuarioId, ct),
            PaginacionPagos = new PaginacionVm
            {
                Controller     = "PerfilUsuario",
                Action         = "Index",
                PaginaActual   = paginaPagos,
                TamanoPagina   = TamanoPaginaPagos,
                TotalRegistros = totalPagos,
                ParamPagina    = "paginaPagos"
            },
            PaginacionNovedades = new PaginacionVm
            {
                Controller     = "PerfilUsuario",
                Action         = "Index",
                PaginaActual   = paginaNovedades,
                TamanoPagina   = TamanoPaginaNovedades,
                TotalRegistros = totalNovedades,
                ParamPagina    = "paginaNovedades"
            }
        };
    }
}
