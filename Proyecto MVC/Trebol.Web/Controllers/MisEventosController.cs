using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trebol.Domain.Interfaces;
using Trebol.Model.DTOs.Sala;
using Trebol.Model.Enums;

namespace Trebol.Web.Controllers;

[Authorize(Roles = "Usuario,Profesional")]
public class MisEventosController(ISalaRepository salaRepo) : Controller
{
    public async Task<IActionResult> Index()
    {
        var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tipo = User.FindFirstValue(ClaimTypes.Role)!;

        if (tipo == "Profesional")
            return View(await salaRepo.ObtenerPorProfesionalAsync(id));

        var inscritos = await salaRepo.ObtenerInscritosUsuarioAsync(id);
        var salas = inscritos.Select(e => new SalaDto
        {
            SalaId       = e.SalaId,
            Titulo       = e.Titulo,
            Tipo         = TipoSala.Publica,
            Estado       = Enum.TryParse<EstadoSala>(e.Estado, true, out var est) ? est : EstadoSala.Abierta,
            Capacidad    = e.Capacidad,
            FechaInicio  = e.FechaInicio,
            TotalInscritos = e.TotalInscritos,
            Categoria    = e.Categoria
        }).ToList();

        return View(salas);
    }
}
