# Arquitectura Técnica – Proyecto Trébol

## 1. Arquitectura Técnica

El sistema Trébol utiliza una arquitectura en capas MVC (.NET Core 10), compartida entre todos los perfiles (Usuario, Profesional y Administrador):

- **Capa Presentation (Web MVC)**
  - Controladores y vistas
  - Filtros
  - `DependencyContainer` / `ApplicationAccessDependency`
    ```csharp
    public static IServiceCollection AddApplication(this IServiceCollection services) { }
    ```
  - AutoMapper

- **Capa Constants**
  - Paginación
  - Utilidades para el manejo de constantes del sistema de tipo `static` (mensajes, plantillas de correo electrónico)

- **Capa Domain**

- **Capa Helpers**
  - AccessDependency
  - Métodos reutilizables en el proyecto

- **Capa Infrastructure**
  - Consultas a la base de datos
  - `AccessDependency`
    ```csharp
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration) { }
    ```
  - Repositorios

- **Capa Model**
  - DTOs, Entity, AppDbContext, Enums, Models