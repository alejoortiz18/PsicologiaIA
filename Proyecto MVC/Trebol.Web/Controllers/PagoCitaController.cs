using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Pagos;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Pago;
using Trebol.Model.Enums;
using Trebol.Web.Services;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario")]
public class PagoCitaController(
    ICitaRepository citaRepo,
    IProfesionalRepository profesionalRepo,
    IPagoRepository pagoRepo,
    IPagoSimuladoService pagoSimulado) : Controller
{
    private static readonly CultureInfo EsCo = new("es-CO");
    private const decimal TarifaPlataformaDefault = 5000m;

    // GET /PagoCita/Confirmar?profesionalId=5&fechaHora=...
    [HttpGet]
    public async Task<IActionResult> Confirmar(int profesionalId, DateTime? fechaHora, int duracionMinutos = 60)
    {
        var perfil = await profesionalRepo.ObtenerDtoAsync(profesionalId, HttpContext.RequestAborted);
        if (perfil is null) return NotFound();

        var tarifaHora = perfil.TarifaCita ?? 0m;
        var subtotal = tarifaHora * (duracionMinutos / 60m);
        if (duracionMinutos == 90) subtotal = tarifaHora * 1.5m;

        var inicio = fechaHora ?? DateTime.Now.AddDays(1).Date.AddHours(9);
        var vm = new CheckoutVm
        {
            Tipo              = "cita",
            ProfesionalId     = profesionalId,
            ReferenciaId      = profesionalId,
            Titulo            = "Cita privada",
            Subtitulo         = perfil.NombreCompleto,
            NombreProfesional = perfil.NombreCompleto,
            FechaHoraCita      = inicio,
            FechaHoraFinCita   = inicio.AddMinutes(duracionMinutos),
            DuracionMinutos   = duracionMinutos,
            Subtotal          = subtotal,
            TarifaPlataforma  = subtotal > 0 ? TarifaPlataformaDefault : 0m
        };

        ViewBag.TipoCita = TipoCita.Asesoria;
        ViewBag.Notas = "";
        return View("~/Views/Inscripcion/Checkout.cshtml", vm);
    }

    // POST /PagoCita/Confirmar
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Confirmar(int profesionalId, DateTime fechaHora, int duracionMinutos, TipoCita tipo, string? notas)
    {
        var perfil = await profesionalRepo.ObtenerDtoAsync(profesionalId, HttpContext.RequestAborted);
        if (perfil is null) return NotFound();

        var dto = new CrearCitaDto
        {
            UsuarioId         = UsuarioId(),
            ProfesionalId     = profesionalId,
            FechaHora          = fechaHora,
            DuracionMinutos   = duracionMinutos,
            Tipo              = tipo,
            Notas             = notas
        };

        var agendar = await citaRepo.AgendarAsync(dto, HttpContext.RequestAborted);
        if (!agendar.Exito || agendar.Datos == 0)
        {
            TempData["Error"] = agendar.Mensaje;
            return RedirectToAction(nameof(Confirmar), new { profesionalId, fechaHora, duracionMinutos });
        }

        var tarifaHora = perfil.TarifaCita ?? 0m;
        var subtotal = tarifaHora * (duracionMinutos / 60m);
        if (duracionMinutos == 90) subtotal = tarifaHora * 1.5m;

        if (subtotal <= 0)
        {
            await pagoRepo.PagarCitaAsync(agendar.Datos, UsuarioId(), "EntradaLibre", HttpContext.RequestAborted);
            return RedirectToAction(nameof(Resultado), new { id = agendar.Datos, exito = true });
        }

        return RedirectToAction(nameof(Pago), new { id = agendar.Datos });
    }

    // GET /PagoCita/Pago/3
    [HttpGet]
    public async Task<IActionResult> Pago(int id)
    {
        var citaId = id;
        var cita = await citaRepo.ObtenerDetalleAsync(citaId, HttpContext.RequestAborted);
        if (cita is null || cita.UsuarioId != UsuarioId()) return NotFound();

        var vm = MapCita(cita);
        vm.CitaId = citaId;
        vm.ReferenciaId = citaId;
        vm.MetodoPago = TempData["MetodoPago"] as string ?? vm.MetodoPago;
        ViewBag.PasoInicial = 2;
        ViewBag.TarjetaPrueba = TarjetaPruebaViewBag();
        return View("~/Views/Inscripcion/Checkout.cshtml", vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ProcesarPago(int id, TarjetaPagoDto tarjeta)
    {
        var citaId = id;
        var validacion = pagoSimulado.ValidarPago(tarjeta);
        if (!validacion.Exito)
        {
            TempData["Error"] = validacion.Mensaje;
            TempData["MetodoPago"] = tarjeta.MetodoPago;
            return RedirectToAction(nameof(Pago), new { id = citaId });
        }

        var pago = await pagoRepo.PagarCitaAsync(citaId, UsuarioId(), tarjeta.MetodoPago, HttpContext.RequestAborted);
        return RedirectToAction(nameof(Resultado), new { id = citaId, exito = pago.Exito });
    }

    [HttpGet]
    public async Task<IActionResult> Resultado(int id, bool exito)
    {
        var citaId = id;
        var cita = await citaRepo.ObtenerDetalleAsync(citaId, HttpContext.RequestAborted);
        if (cita is null || cita.UsuarioId != UsuarioId()) return NotFound();

        var vm = MapCita(cita);
        vm.CitaId = citaId;
        ViewBag.PasoInicial = 3;
        ViewBag.Exito = exito;
        ViewBag.MensajeResultado = exito ? "¡Cita confirmada y pagada!" : "No se pudo completar el pago.";
        return View("~/Views/Inscripcion/Checkout.cshtml", vm);
    }

    private int UsuarioId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static object TarjetaPruebaViewBag() => new
    {
        numero = "4242 4242 4242 4242",
        vencimiento = TarjetaPruebaConstant.VencimientoValido,
        cvv = TarjetaPruebaConstant.CvvValido,
        nombre = TarjetaPruebaConstant.NombreValido
    };

    private static CheckoutVm MapCita(CitaListaDto cita)
    {
        var subtotal = cita.Monto > 0 ? cita.Monto : 0;
        return new CheckoutVm
        {
            Tipo              = "cita",
            Titulo            = "Cita privada",
            Subtitulo         = cita.NombreProfesional,
            NombreProfesional = cita.NombreProfesional,
            FechaHoraCita      = cita.FechaHora,
            FechaHoraFinCita   = cita.FechaHora.AddMinutes(cita.DuracionMinutos),
            DuracionMinutos   = cita.DuracionMinutos,
            Subtotal          = subtotal,
            TarifaPlataforma  = subtotal > 0 ? TarifaPlataformaDefault : 0m
        };
    }
}
