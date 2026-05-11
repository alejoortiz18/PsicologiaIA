# Arquitectura Técnica — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server

---

## 1. Arquitectura en Capas

El sistema utiliza una arquitectura en capas MVC compartida entre el perfil Usuario y el perfil Profesional. Cada capa tiene una responsabilidad única y bien definida.

### 1.1 Capa Presentation (Web MVC)

Responsable de la interfaz y la interacción con el usuario.

| Componente | Descripción |
|---|---|
| Controladores | Reciben peticiones HTTP y coordinan la respuesta |
| Vistas | Renders HTML, alineadas con las [reglas UI/UX del proyecto](../../reglas-ui-ux-frontend.md) |
| Filtros | Interceptan peticiones (autenticación, autorización, logging) |
| AutoMapper | Mapeo entre entidades de dominio y DTOs de presentación |
| `DependencyContainer` | `ApplicationAccessDependency` registrado como extensión de `IServiceCollection` |

```csharp
public static IServiceCollection AddApplication(this IServiceCollection services) { }
```

**Reglas UI/UX aplicadas en esta capa:**
- Toda tabla de datos se renderiza con paginación de **10 registros** por defecto.
- Todos los mensajes del sistema (errores, confirmaciones, advertencias) se presentan mediante **modal**.
- Los campos de fecha se muestran en formato **`DD MMM YYYY`** (ej: `15 Oct 2026`).
- Los campos de hora se muestran en formato **12H** (ej: `3PM`, `3:30PM`).
- Fecha y hora combinadas: `8 Oct 2026 3PM`.

---

### 1.2 Capa Constants

Centraliza los valores fijos y configuraciones compartidas del sistema.

- Configuración de paginación (valor por defecto: `10`)
- Mensajes del sistema (errores, éxito, advertencias)
- Plantillas de correo electrónico
- Constantes de tipo `static` accesibles globalmente

---

### 1.3 Capa Domain

Contiene las reglas de negocio del sistema, independiente de cualquier framework o infraestructura.

---

### 1.4 Capa Helpers

Proporciona utilidades reutilizables en todo el proyecto.

- Métodos de uso general (formateo de fechas, validaciones comunes)
- `AccessDependency`: registro de dependencias de los helpers
- **`PasswordHelper`**: servicio responsable de la encriptación y verificación de contraseñas mediante doble encriptación **Hash + Salt** usando el algoritmo **Argon2** (salt embebido en el hash). Provee dos métodos principales:
  - `HashPassword(string password) → string` — genera el hash Argon2 con salt integrado
  - `VerifyPassword(string password, string hash) → bool` — verifica la contraseña contra el hash almacenado

  > **Regla transversal:** todo el sistema usa `PasswordHelper` para generar y verificar contraseñas, sin excepción. Ningún otro componente debe manipular contraseñas directamente.

---

### 1.5 Capa Infrastructure

Gestiona el acceso a datos y la comunicación con recursos externos.

| Componente | Descripción |
|---|---|
| Repositories | Implementación del patrón Repository para acceso a base de datos |
| Consultas a BD | Queries a SQL Server usando EF Core |
| `AccessDependency` | Extensión de `IServiceCollection` para registro de infraestructura |

```csharp
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration) { }
```

---

### 1.6 Capa Model

Contiene los modelos de datos y contratos del sistema.

| Componente | Contenido |
|---|---|
| `DTOs` | Objetos de transferencia de datos entre capas |
| `Entities` | Entidades mapeadas a tablas de base de datos |
| `AppDbContext` | Contexto de Entity Framework Core |
| `Enums` | Enumeraciones del dominio (estados, tipos, roles) |
| `Models` | Modelos de vista y contratos de API |

---

## 2. Requerimientos Funcionales — Perfil Profesional

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01 | Registro del profesional con datos básicos y documentos | Alta |
| RF-02 | Carga obligatoria de documento de identidad y certificado profesional (PDF) | Alta |
| RF-03 | Validación manual del administrador antes de habilitar la cuenta | Alta |
| RF-04 | Activación del perfil profesional tras aprobación del administrador | Alta |
| RF-05 | Creación y configuración de salas virtuales (nombre, descripción, cupos, modalidad, precio) | Alta |
| RF-06 | Habilitación y deshabilitación de salas | Media |
| RF-07 | Visualización de usuarios inscritos en cada sala | Media |
| RF-08 | Recepción de pagos y control de ingresos | Alta |
| RF-09 | Panel de control con métricas y reportes | Media |
| RF-10 | Cierre automático de sesión por inactividad | Media |

---

## 3. Requerimientos No Funcionales

| Atributo | Descripción |
|---|---|
| **Seguridad** | Validación de identidad y certificaciones antes de habilitar la cuenta profesional. **Toda contraseña se almacena con doble encriptación Hash + Salt (Argon2) a través de la Capa Helpers. Nunca se persiste texto plano.** |
| **Integridad** | Los documentos del profesional se almacenan en el correo del sistema para revisión manual |
| **Rendimiento** | Los listados de salas y usuarios deben cargar en menos de **2 segundos** |
| **Escalabilidad** | El sistema debe soportar el crecimiento en número de salas y sesiones simultáneas |
| **Usabilidad** | Panel profesional adaptable a pantallas grandes; interfaz intuitiva conforme a las reglas UI/UX del proyecto |
| **Mantenibilidad** | Código desacoplado mediante el patrón Repository y la inyección de dependencias |

---

## 4. Flujos Funcionales

### 4.1 Registro y Validación del Profesional

```
1. El profesional selecciona "Registrarse como profesional".
2. Completa el formulario de datos básicos y adjunta los documentos requeridos.
3. El sistema crea la cuenta en estado INACTIVO.
4. El sistema envía un correo al profesional con enlace de validación de correo.
5. El sistema envía los datos y documentos adjuntos al correo del administrador.
6. El administrador revisa los documentos y aprueba o rechaza la cuenta.
7. Si es aprobada: el sistema envía correo de aprobación con enlace y token
   para establecer contraseña (vigencia: 1 día).
8. El profesional establece su contraseña y accede a la plataforma.
9. Si es rechazada: el sistema notifica al profesional con el motivo del rechazo.
```

**Reglas de UI para este flujo:**
- Los errores de formulario se muestran como **modal** (no alertas nativas).
- El botón "Registrar" muestra spinner y se deshabilita durante el envío (protección contra doble envío).
- La carga de documentos PDF muestra el nombre del archivo seleccionado.

---

### 4.2 Creación de Salas

```
1. El profesional accede a "Mis Salas" desde el panel principal.
2. Selecciona "Crear nueva sala".
3. Completa el formulario:
   - Nombre de la sala
   - Tipo: paga o gratuita
   - Cupo máximo de usuarios
   - Precio (solo si es de tipo paga)
   - Descripción
4. Guarda y habilita la sala.
5. El sistema publica la sala y la hace visible a los usuarios registrados.
```

---

### 4.3 Gestión de Usuarios en Sala

```
1. El profesional visualiza la lista de usuarios inscritos (tabla paginada, 10 por página).
2. Puede aceptar, expulsar o bloquear el acceso de un usuario.
3. El sistema controla la capacidad máxima en tiempo real.
```

---

### 4.4 Pagos y Liquidaciones

```
1. Los usuarios pagan el acceso a las salas de tipo paga.
2. El sistema retiene la comisión definida en parámetros globales de administración.
3. El profesional visualiza su saldo acumulado y el detalle de pagos por sesión.
4. El profesional puede descargar reportes y comprobantes.
```

---

### 4.5 Panel de Control Profesional

El dashboard muestra un resumen con:

- Ingresos totales acumulados
- Número de usuarios atendidos
- Sesiones realizadas
- Salas activas e inactivas

Desde el panel, el profesional puede editar su perfil profesional.

---

### 4.6 Cierre Automático por Inactividad

- Implementado mediante `SessionExpirationMiddleware`.
- El tiempo de inactividad es configurable desde `appsettings.json`.
- Comportamiento idéntico para el perfil Usuario y el perfil Profesional.

---

## 5. Product Backlog — Perfil Profesional

| ID | Funcionalidad | Prioridad | Tipo |
|---|---|---|---|
| PF-01 | Registro del profesional | Alta | Core |
| PF-02 | Carga de documentos | Alta | Core |
| PF-03 | Validación administrativa | Alta | Control |
| PF-04 | Activación de cuenta profesional | Alta | Core |
| PF-05 | Creación de salas | Alta | Funcional |
| PF-06 | Gestión de usuarios en salas | Media | Funcional |
| PF-07 | Sistema de pagos y liquidaciones | Alta | Financiera |
| PF-08 | Reportes de sesiones e ingresos | Media | Analítica |
| PF-09 | Panel de control profesional | Media | Visual |
| PF-10 | Seguridad y expiración de sesión | Media | Seguridad |

---

## 6. Planificación por Ciclos (Shape Up)

> Cada ciclo tiene un **apetito fijo**. El scope se ajusta al tiempo, no al contrario.

### Ciclo 1 — Estructura del Proyecto y Base de Datos
**Apetito:** 1 semana
- Configurar la arquitectura MVC base con todas las capas
- Crear entidades: `Profesional`, `Documento`, `Sala`, `Sesion`, `Pago`
- Ejecutar migraciones iniciales
- **Criterio de done:** Conexión establecida, tablas creadas, estructura compilando

### Ciclo 2 — Registro del Profesional
**Apetito:** 1 semana
- Crear `AuthController` con vista `RegistroProfesional`
- Captura de datos básicos y carga de documentos
- Validaciones de formulario con mensajes en **modal**
- **Criterio de done:** Formulario funcional, datos guardados, documentos enviados al correo del sistema

### Ciclos siguientes
Definir apetito y scope antes de iniciar cada uno, siguiendo la estructura de Shape Up:
`Problema → Apetito → Límites → Solución visible → No-Gos → Riesgos`

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*
