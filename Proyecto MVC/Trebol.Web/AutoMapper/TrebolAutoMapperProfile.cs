using AutoMapper;
using Trebol.Model.DTOs.Dashboard;
using Trebol.Model.DTOs.Profesional;
using Trebol.Model.DTOs.Usuario;
using Trebol.Model.Entities.TrebolEntities;

namespace Trebol.Web.AutoMapper;

public class TrebolAutoMapperProfile : Profile
{
    public TrebolAutoMapperProfile()
    {
        // Entidad → DTO
        CreateMap<Usuario,    UsuarioDto>();
        CreateMap<Profesional, ProfesionalDto>();

        // DTO → DTO (proyecciones adicionales si hacen falta)
        CreateMap<DashboardUsuarioDto,    DashboardUsuarioDto>();
        CreateMap<DashboardProfesionalDto, DashboardProfesionalDto>();
    }
}
