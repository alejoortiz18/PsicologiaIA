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
    ICitaRepository citaRepo) : Controller
{
    private const int TamanoPaginaEventos = 7;
    private const int LimiteCitasProximas = 10;

    private static readonly JsonSerializerOptions JsonCamel = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task<IActionResult> Index(int paginaEventos = 1, string? tab = null, CancellationToken ct = default)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await usuarioRepo.ObtenerPorIdAsync(id, ct);
        if (user is null) return NotFound();

        var vm = await ConstruirViewModelAsync(user, paginaEventos, ct);
        vm.MensajeExito = TempData["Mensaje"] as string;
        ViewBag.TabActiva = tab switch
        {
            "citas" or "agenda" => "citas",
            "eventos" => "eventos",
            _ => paginaEventos > 1 ? "eventos" : "cuenta"
        };
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
            var vm = await ConstruirViewModelAsync(existente, 1, ct);
            return View("Index", vm);
        }

        var resultado = await usuarioRepo.ActualizarAsync(dto, ct);
        if (!resultado.Exito)
        {
            ModelState.AddModelError(string.Empty, resultado.Mensaje);
            existente.Alias   = dto.Alias;
            existente.Celular = dto.Celular;
            var vm = await ConstruirViewModelAsync(existente, 1, ct);
            return View("Index", vm);
        }

        TempData["Mensaje"] = PerfilConstant.PerfilActualizado;
        return RedirectToAction(nameof(Index));
    }

    private async Task<PerfilUsuarioViewModel> ConstruirViewModelAsync(
        Usuario user, int paginaEventos, CancellationToken ct)
    {
        paginaEventos = Math.Max(1, paginaEventos);
        var totalEventos = await usuarioRepo.ContarEventosInscritosPerfilAsync(user.UsuarioId, ct);
        var totalPaginas = TamanoPaginaEventos > 0
            ? (int)Math.Ceiling(totalEventos / (double)TamanoPaginaEventos)
            : 0;
        if (totalPaginas > 0 && paginaEventos > totalPaginas)
            paginaEventos = totalPaginas;

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
                Controller      = "PerfilUsuario",
                Action          = "Index",
                PaginaActual    = paginaEventos,
                TamanoPagina    = TamanoPaginaEventos,
                TotalRegistros  = totalEventos
            }
        };
    }
}
