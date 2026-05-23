using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Constants.Pagos;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Pago;
using Trebol.Web.Helpers;
using Trebol.Web.Services;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class InscripcionController(
    IInscripcionRepository inscripcionRepo,
    ISalaRepository salaRepo,
    IPagoRepository pagoRepo,
    IPagoSimuladoService pagoSimulado) : Controller
{
    private static readonly CultureInfo EsCo = new("es-CO");

    [HttpGet]
    public async Task<IActionResult> Confirmar(int id)
    {
        var participante = InscripcionParticipante.From(User);
        var sala = await salaRepo.ObtenerDetalleInscripcionAsync(
            id, participante.UsuarioId, participante.ProfesionalInscriptorId, HttpContext.RequestAborted);
        if (sala is null) return NotFound();

        if (sala.EsInscrito)
        {
            TempData["Mensaje"] = "Ya estás inscrito en este evento.";
            return RedirigirTrasInscripcion();
        }

        if (sala.Capacidad > 0 && sala.TotalInscritos >= sala.Capacidad)
        {
            TempData["Error"] = "Este evento ya no tiene cupos disponibles.";
            return RedirigirTrasInscripcion();
        }

        return View("Checkout", MapSala(sala));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ConfirmarInscripcion(int id)
    {
        var participante = InscripcionParticipante.From(User);
        var resultado = await inscripcionRepo.InscribirAsync(
            id, participante.UsuarioId, participante.ProfesionalInscriptorId, HttpContext.RequestAborted);
        if (!resultado.Exito || resultado.Datos is null)
        {
            TempData["Error"] = resultado.Mensaje;
            return RedirectToAction(nameof(Confirmar), new { id });
        }

        var ins = resultado.Datos;
        if (ins.Precio <= 0 || ins.EstadoInscripcion is "Confirmada")
        {
            TempData["Mensaje"] = resultado.Mensaje;
            return RedirectToAction(nameof(Resultado), new { id = ins.InscripcionId, exito = true });
        }

        return RedirectToAction(nameof(Pago), new { id = ins.InscripcionId });
    }

    [HttpGet]
    public async Task<IActionResult> Pago(int id)
    {
        var participante = InscripcionParticipante.From(User);
        var ins = await inscripcionRepo.ObtenerPorIdAsync(
            id, participante.UsuarioId, participante.ProfesionalInscriptorId, HttpContext.RequestAborted);
        if (ins is null) return NotFound();

        var sala = await salaRepo.ObtenerDetalleInscripcionAsync(
            ins.SalaId, participante.UsuarioId, participante.ProfesionalInscriptorId, HttpContext.RequestAborted);
        if (sala is null) return NotFound();

        var vm = MapSala(sala);
        vm.InscripcionId = id;
        vm.ReferenciaId = id;
        vm.CodigoInscripcion = ins.CodigoInscripcion;
        ViewBag.PasoInicial = 2;
        vm.MetodoPago = TempData["MetodoPago"] as string ?? vm.MetodoPago;
        ViewBag.TarjetaPrueba = new
        {
            numero = "4242 4242 4242 4242",
            vencimiento = TarjetaPruebaConstant.VencimientoValido,
            cvv = TarjetaPruebaConstant.CvvValido,
            nombre = TarjetaPruebaConstant.NombreValido
        };
        return View("Checkout", vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ProcesarPago(int id, TarjetaPagoDto tarjeta)
    {
        var validacion = pagoSimulado.ValidarPago(tarjeta);
        if (!validacion.Exito)
        {
            TempData["Error"] = validacion.Mensaje;
            TempData["MetodoPago"] = tarjeta.MetodoPago;
            return RedirectToAction(nameof(Pago), new { id });
        }

        var pago = await pagoRepo.PagarInscripcionAsync(id, tarjeta.MetodoPago, HttpContext.RequestAborted);
        if (!pago.Exito && pago.Codigo == "SinCupos")
            return RedirectToAction(nameof(Resultado), new { id, exito = false, sinCupos = true });

        return RedirectToAction(nameof(Resultado), new { id, exito = pago.Exito });
    }

    [HttpGet]
    public async Task<IActionResult> Resultado(int id, bool exito, bool sinCupos = false)
    {
        var participante = InscripcionParticipante.From(User);
        var ins = await inscripcionRepo.ObtenerPorIdAsync(
            id, participante.UsuarioId, participante.ProfesionalInscriptorId, HttpContext.RequestAborted);
        if (ins is null) return NotFound();

        var sala = await salaRepo.ObtenerDetalleInscripcionAsync(
            ins.SalaId, participante.UsuarioId, participante.ProfesionalInscriptorId, HttpContext.RequestAborted);
        if (sala is null) return NotFound();

        var vm = MapSala(sala);
        vm.InscripcionId = id;
        vm.CodigoInscripcion = ins.CodigoInscripcion;
        ViewBag.PasoInicial = 3;
        ViewBag.Exito = exito;
        ViewBag.SinCupos = sinCupos;
        ViewBag.MensajeResultado = sinCupos
            ? "Los cupos se agotaron mientras procesabas el pago."
            : (exito ? "¡Inscripción exitosa!" : "No se pudo completar el pago.");
        return View("Checkout", vm);
    }

    private IActionResult RedirigirTrasInscripcion()
        => User.IsInRole("Usuario")
            ? RedirectToAction("Index", "Eventos")
            : RedirectToAction("Index", "HomeProfesional");

    private static CheckoutVm MapSala(Trebol.Model.DTOs.Publico.SalaDetalleUsuarioDto sala)
    {
        var cupos = Math.Max(0, sala.Capacidad - sala.TotalInscritos);
        return new CheckoutVm
        {
            Tipo              = "inscripcion",
            ReferenciaId      = sala.SalaId,
            SalaId            = sala.SalaId,
            ProfesionalId     = sala.ProfesionalId,
            Titulo            = sala.Titulo,
            Subtitulo         = $"{sala.NombreProfesional} · {sala.Categoria ?? "Evento"}",
            Descripcion       = sala.Descripcion,
            NombreProfesional = sala.NombreProfesional,
            FotoOrador        = sala.FotoOrador,
            FechaEvento       = sala.FechaInicio,
            Capacidad         = sala.Capacidad,
            TotalInscritos    = sala.TotalInscritos,
            CuposDisponibles  = cupos,
            Subtotal          = sala.Precio,
            TarifaPlataforma  = sala.Precio > 0 ? 5000m : 0m
        };
    }
}
