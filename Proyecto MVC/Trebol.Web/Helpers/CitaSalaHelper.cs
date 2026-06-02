using Trebol.Model.Enums;

namespace Trebol.Web.Helpers;

public static class CitaSalaHelper
{
    public static bool PuedeIngresar(EstadoCita estado, DateTime fechaHora, DateTime fechaHoraFin)
    {
        if (estado is not (EstadoCita.Programada or EstadoCita.Movida))
            return false;

        if (fechaHora.Date != DateTime.Today)
            return false;

        return fechaHoraFin >= DateTime.Now.AddMinutes(-15);
    }
}
