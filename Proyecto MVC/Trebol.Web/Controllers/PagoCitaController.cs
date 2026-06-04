using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Messages;
using Trebol.Constants.Pagos;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Cita;
using Trebol.Model.DTOs.Pago;
using Trebol.Model.Enums;
using Trebol.Web.Helpers;
using Trebol.Web.Services;
using Trebol.Web.ViewModels.Cita;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class PagoCitaController(
    ICitaRepository citaRepo,
    IProfesionalRepository profesionalRepo,
    IPagoRepository pagoRepo,
    IPagoSimuladoService pagoSimulado,
    ICitaPrecioService citaPrecio) : Controller
{
    [HttpGet]
    public async Task<IActionResult> SeleccionarTipo(int profesionalId, DateTime? fechaHora, int duracionMinutos = 60)
    {
        var cliente = CitaCliente.From(User);
        if (cliente.ProfesionalClienteId == profesionalId)
        {
            TempData["Error"] = "No puedes agendar una cita contigo mismo.";
            return RedirectToAction("Calendario", "PerfilOrador", new { id = profesionalId });
        }

        var perfil = await profesionalRepo.ObtenerDtoAsync(profesionalId, HttpContext.RequestAborted);
        if (perfil is null) return NotFound();

        if (!fechaHora.HasValue)
        {
            TempData["Error"] = "Selecciona un horario en el calendario.";
            return RedirectToAction("Calendario", "PerfilOrador", new { id = profesionalId });
        }

        if (fechaHora.Value < DateTime.Now)
        {
            TempData["Error"] = CitaConstant.HorarioYaPasado;
            return RedirectToAction("Calendario", "PerfilOrador", new { id = profesionalId });
        }

        return View(new SeleccionarTipoCitaViewModel
        {
            ProfesionalId     = profesionalId,
            FechaHora         = fechaHora.Value,
            DuracionMinutos   = duracionMinutos,
            NombreProfesional = perfil.NombreCompleto
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SeleccionarTipo(SeleccionarTipoCitaViewModel vm, CancellationToken ct)
    {
        if (!ModelState.IsValid || !vm.Tipo.HasValue)
        {
            if (string.IsNullOrWhiteSpace(vm.NombreProfesional))
            {
                var perfil = await profesionalRepo.ObtenerDtoAsync(vm.ProfesionalId, ct);
                if (perfil is not null) vm.NombreProfesional = perfil.NombreCompleto;
            }
            return View(vm);
        }

        return RedirectToAction(nameof(Confirmar), new
        {
            profesionalId   = vm.ProfesionalId,
            fechaHora       = vm.FechaHora,
            duracionMinutos = vm.DuracionMinutos,
            tipo            = vm.Tipo.Value
        });
    }

    [HttpGet]
    public async Task<IActionResult> Confirmar(int profesionalId, DateTime? fechaHora, int duracionMinutos = 60, TipoCita? tipo = null)
    {
        if (!tipo.HasValue)
            return RedirectToAction(nameof(SeleccionarTipo), new { profesionalId, fechaHora, duracionMinutos });

        var cliente = CitaCliente.From(User);
        if (cliente.ProfesionalClienteId == profesionalId)
        {
            TempData["Error"] = "No puedes agendar una cita contigo mismo.";
            return RedirectToAction("Calendario", "PerfilOrador", new { id = profesionalId });
        }

        var perfil = await profesionalRepo.ObtenerDtoAsync(profesionalId, HttpContext.RequestAborted);
        if (perfil is null) return NotFound();

        if (fechaHora.HasValue && fechaHora.Value < DateTime.Now)
        {
            TempData["Error"] = CitaConstant.HorarioYaPasado;
            return RedirectToAction("Calendario", "PerfilOrador", new { id = profesionalId });
        }

        var tarifaHora = perfil.TarifaCita ?? 0m;
        var precio = await citaPrecio.CalcularAsync(tarifaHora, duracionMinutos, HttpContext.RequestAborted);
        var inicio = fechaHora ?? DateTime.Now.AddDays(1).Date.AddHours(9);

        var vm = new CheckoutVm
        {
            Tipo              = "cita",
            TipoCita          = tipo.Value,
            ProfesionalId     = profesionalId,
            ReferenciaId      = profesionalId,
            Titulo            = CitaTipoHelper.Etiqueta(tipo.Value),
            Subtitulo         = perfil.NombreCompleto,
            NombreProfesional = perfil.NombreCompleto,
            FechaHoraCita     = inicio,
            FechaHoraFinCita  = inicio.AddMinutes(duracionMinutos),
            DuracionMinutos   = duracionMinutos,
            Subtotal          = precio.Subtotal,
            PorcentajeIva     = precio.PorcentajeIva
        };

        ViewBag.Notas = "";
        return View("~/Views/Inscripcion/Checkout.cshtml", vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Confirmar(int profesionalId, DateTime fechaHora, int duracionMinutos, TipoCita tipo, string? notas)
    {
        var cliente = CitaCliente.From(User);
        if (cliente.ProfesionalClienteId == profesionalId)
        {
            TempData["Error"] = "No puedes agendar una cita contigo mismo.";
            return RedirectToAction(nameof(SeleccionarTipo), new { profesionalId, fechaHora, duracionMinutos });
        }

        var perfil = await profesionalRepo.ObtenerDtoAsync(profesionalId, HttpContext.RequestAborted);
        if (perfil is null) return NotFound();

        if (fechaHora < DateTime.Now)
        {
            TempData["Error"] = CitaConstant.HorarioYaPasado;
            return RedirectToAction(nameof(SeleccionarTipo), new { profesionalId, fechaHora, duracionMinutos });
        }

        var dto = new CrearCitaDto
        {
            UsuarioId            = cliente.UsuarioId,
            ProfesionalClienteId = cliente.ProfesionalClienteId,
            ProfesionalId        = profesionalId,
            FechaHora            = fechaHora,
            DuracionMinutos      = duracionMinutos,
            Tipo                 = tipo,
            Notas                = notas
        };

        var agendar = await citaRepo.AgendarAsync(dto, HttpContext.RequestAborted);
        if (!agendar.Exito || agendar.Datos == 0)
        {
            TempData["Error"] = agendar.Mensaje;
            return RedirectToAction(nameof(Confirmar), new { profesionalId, fechaHora, duracionMinutos, tipo });
        }

        var tarifaHora = perfil.TarifaCita ?? 0m;
        var precio = await citaPrecio.CalcularAsync(tarifaHora, duracionMinutos, HttpContext.RequestAborted);
        if (precio.Subtotal <= 0)
        {
            await pagoRepo.PagarCitaAsync(
                agendar.Datos, cliente.UsuarioId, cliente.ProfesionalClienteId,
                "TarjetaCredito", 0, 0, HttpContext.RequestAborted);
            return RedirectToAction(nameof(Resultado), new { id = agendar.Datos, exito = true });
        }

        return RedirectToAction(nameof(Pago), new { id = agendar.Datos });
    }

    [HttpGet]
    public async Task<IActionResult> Pago(int id)
    {
        var cliente = CitaCliente.From(User);
        var cita = await citaRepo.ObtenerDetalleParaClienteAsync(
            id, cliente.UsuarioId, cliente.ProfesionalClienteId, HttpContext.RequestAborted);
        if (cita is null) return NotFound();

        var vm = await MapCitaAsync(cita);
        vm.CitaId = id;
        vm.ReferenciaId = id;
        vm.MetodoPago = TempData["MetodoPago"] as string ?? vm.MetodoPago;
        ViewBag.PasoInicial = 2;
        ViewBag.TarjetaPrueba = TarjetaPruebaViewBag();
        return View("~/Views/Inscripcion/Checkout.cshtml", vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ProcesarPago(int id, TarjetaPagoDto tarjeta)
    {
        var cliente = CitaCliente.From(User);
        var cita = await citaRepo.ObtenerDetalleParaClienteAsync(
            id, cliente.UsuarioId, cliente.ProfesionalClienteId, HttpContext.RequestAborted);
        if (cita is null) return NotFound();

        var validacion = pagoSimulado.ValidarPago(tarjeta);
        if (!validacion.Exito)
        {
            TempData["Error"] = validacion.Mensaje;
            TempData["MetodoPago"] = tarjeta.MetodoPago;
            return RedirectToAction(nameof(Pago), new { id });
        }

        var vm = await MapCitaAsync(cita);
        var pago = await pagoRepo.PagarCitaAsync(
            id, cliente.UsuarioId, cliente.ProfesionalClienteId,
            tarjeta.MetodoPago, vm.Total, vm.MontoIva, HttpContext.RequestAborted);
        return RedirectToAction(nameof(Resultado), new { id, exito = pago.Exito });
    }

    [HttpGet]
    public async Task<IActionResult> Resultado(int id, bool exito)
    {
        var cliente = CitaCliente.From(User);
        var cita = await citaRepo.ObtenerDetalleParaClienteAsync(
            id, cliente.UsuarioId, cliente.ProfesionalClienteId, HttpContext.RequestAborted);
        if (cita is null) return NotFound();

        var vm = await MapCitaAsync(cita);
        vm.CitaId = id;
        ViewBag.PasoInicial = 3;
        ViewBag.Exito = exito;
        ViewBag.MensajeResultado = exito ? "¡Cita confirmada y pagada!" : "No se pudo completar el pago.";
        return View("~/Views/Inscripcion/Checkout.cshtml", vm);
    }

    private async Task<CheckoutVm> MapCitaAsync(CitaListaDto cita)
    {
        var precio = await citaPrecio.CalcularAsync(cita.Monto, cita.DuracionMinutos, HttpContext.RequestAborted);
        return new CheckoutVm
        {
            Tipo              = "cita",
            TipoCita          = cita.Tipo,
            Titulo            = CitaTipoHelper.Etiqueta(cita.Tipo),
            Subtitulo         = cita.NombreProfesional,
            NombreProfesional = cita.NombreProfesional,
            FechaHoraCita     = cita.FechaHora,
            FechaHoraFinCita  = cita.FechaHora.AddMinutes(cita.DuracionMinutos),
            DuracionMinutos   = cita.DuracionMinutos,
            Subtotal          = precio.Subtotal,
            PorcentajeIva     = precio.PorcentajeIva
        };
    }

    private static object TarjetaPruebaViewBag() => new
    {
        numero = "4242 4242 4242 4242",
        vencimiento = TarjetaPruebaConstant.VencimientoValido,
        cvv = TarjetaPruebaConstant.CvvValido,
        nombre = TarjetaPruebaConstant.NombreValido
    };
}
