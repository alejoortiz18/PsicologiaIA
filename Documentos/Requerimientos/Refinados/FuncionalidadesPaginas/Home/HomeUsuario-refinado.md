# Home — Dashboard del Usuario — Proyecto Trébol

> **Versión:** 2.0 | **Refinado con:** [Shape Up – Basecamp](https://basecamp.com/shapeup)
> **Tecnología:** .NET Core 10 | **Plataforma:** Web MVC | **Base de datos:** SQL Server
> **Fase:** 2 — Experiencia del Usuario | **Apetito:** 1–2 semanas

---

## 1. Problema

El usuario autenticado necesita una vista central que le muestre de un vistazo su actividad relevante (citas próximas, eventos inscritos, mensajes, profesionales seguidos), le permita acceder rápidamente a su próxima cita y descubrir eventos y profesionales sugeridos.

---

## 2. Apetito

**1 a 2 semanas.**
Dashboard con saludo personalizado, 4 KPI cards, sección de próxima cita destacada, eventos recomendados, profesionales sugeridos y botones de acceso rápido.

---

## 3. Límites

### ✅ Dentro del scope

- Saludo personalizado: "Buenos días / tardes / noches, [Nombre]"
- 4 tarjetas KPI: Próximas citas · Eventos inscritos · Profesionales seguidos · Mensajes sin leer
- Sección "Tu próxima cita" — card destacada con botón "Ingresar"
- Sección "Eventos recomendados" — 3 cards con botón "Inscribirse"
- Sección "Profesionales sugeridos" — cards con botón "Seguir"
- Botones de acceso rápido al menú principal

### ❌ Fuera del scope (No-Gos)

- Modal de detalle de sala (corresponde al módulo `DetalleSala`)
- Proceso de inscripción y pago (corresponde a `InscripcionPago`)
- Dashboard del Profesional (es una vista independiente: `HomeProfesional`)
- Listado paginado completo de eventos (corresponde al directorio)

---

## 4. Solución Visible

### Encabezado — Saludo personalizado

| Elemento | Descripción |
|---|---|
| Saludo dinámico | "Buenos días, María" / "Buenas tardes, María" / "Buenas noches, María" según hora del servidor |
| Subtítulo | Frase motivacional o resumen breve de actividad ("Tienes 2 citas esta semana") |

### Strip de 4 KPI Cards

| Card | Valor | Ícono | Color |
|---|---|---|---|
| **Próximas citas** | Total de citas programadas futuras | 📅 | Verde |
| **Eventos inscritos** | Total de eventos activos en los que está inscrito | 🎟 | Azul |
| **Profesionales seguidos** | Total de profesionales que sigue | 👥 | Morado |
| **Mensajes sin leer** | Cantidad de mensajes no leídos en la bandeja | 💬 | Naranja |

Cada card es **clickeable** y navega a la sección correspondiente del sidebar.

### Sección "Tu próxima cita" — Card destacada

| Elemento | Descripción |
|---|---|
| Avatar del profesional | Imagen circular del profesional de la cita |
| Nombre del profesional | Nombre completo |
| Tipo de cita | Psicológica / Asesoría puntual |
| Fecha y hora | Formato `DD MMM YYYY · H:MMAM/PM` |
| Estado | Badge "Programada" (verde) |
| Botón **"Ingresar"** | Solo activo el día de la cita → `sala-usuario.html` |
| Botón **"Ver mis citas"** | Navega a `citas-usuario.html` |
| Mensaje si no hay citas | "No tienes citas próximas. [Agendar cita]" |

### Sección "Eventos recomendados" — 3 cards

| Campo | Descripción |
|---|---|
| Imagen / banner del evento | Imagen representativa de la sala |
| Título del evento | Nombre de la sala |
| Orador | Avatar + nombre del profesional |
| Fecha y hora | Formato `DD MMM YYYY · H:MMAM/PM` |
| Cupos restantes | `X cupos disponibles` |
| Precio | `$XX.000 COP` o "Entrada libre" |
| Botón **"Inscribirse"** | → `inscripcion-pago.html` con datos precargados |
| Botón **"Ver detalle"** | Abre modal de `DetalleSala` |

Los eventos recomendados se seleccionan por: especialidades del profesional que el usuario sigue + categorías de eventos anteriores.

### Sección "Profesionales sugeridos"

| Campo | Descripción |
|---|---|
| Avatar circular | Foto del profesional |
| Nombre | Nombre completo o alias |
| Especialidad | Especialidad principal |
| Rating | Estrellas ★ + puntaje numérico |
| Seguidores | Número de seguidores |
| Botón **"+ Seguir"** | Sigue al profesional; cambia a "✓ Siguiendo" (toggle) |
| Botón **"Ver perfil"** | → `perfil-orador.html` |

### Botones de acceso rápido

| Botón | Destino |
|---|---|
| Mis citas | `citas-usuario.html` |
| Mis eventos | Sección eventos inscritos en `perfil-usuario.html` |
| Buscar especialistas | `especialistas.html` |
| Mensajes | `mensajes-usuario.html` |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Clic en KPI card "Próximas citas" | Navega a `citas-usuario.html` |
| Clic en KPI card "Eventos inscritos" | Navega a tab Eventos en `perfil-usuario.html` |
| Clic en KPI card "Profesionales seguidos" | Navega a `mis-mentores.html` |
| Clic en KPI card "Mensajes sin leer" | Navega a `mensajes-usuario.html` |
| Clic en "Ingresar" (próxima cita) | Navega a `sala-usuario.html` (solo el día de la cita) |
| Clic en "Inscribirse" (evento recomendado) | Navega a `inscripcion-pago.html` |
| Clic en "+ Seguir" (profesional sugerido) | Sigue al profesional; botón cambia a "✓ Siguiendo" |
| Clic en "Ver perfil" (profesional sugerido) | Navega a `perfil-orador.html` |

---

## 6. Restricciones

- El botón **"Ingresar"** en la próxima cita solo está activo **el día de la cita** (validado con fecha del servidor).
- Si el usuario no tiene citas próximas, la sección muestra un mensaje vacío con CTA para agendar.
- Si no hay eventos recomendados, se muestran los más populares de la plataforma.
- Los profesionales sugeridos excluyen los que el usuario ya sigue.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Saludo dinámico | Mañana: 6h–12h · Tarde: 12h–18h · Noche: 18h–6h (hora del servidor) |
| KPI cards | Calculadas en tiempo real al cargar el dashboard |
| Próxima cita destacada | La cita con `FechaHora` más próxima y `Estado = Programada` |
| "Ingresar" activo | Solo si `fecha_servidor == fecha_cita` |
| Eventos recomendados | Basados en afinidad (especialidades seguidas + historial); fallback: Top 3 populares |
| Profesionales sugeridos | Excluyen los ya seguidos; ordenados por rating y seguidores |
| Formato fechas | `DD MMM YYYY` |
| Formato horas | 12H (ej: `3PM`, `3:30PM`) |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Dashboard lento con muchas consultas simultáneas | Caché por usuario con TTL corto (1–2 minutos) para KPIs |
| Usuario sin datos suficientes para recomendaciones | Fallback a contenido popular de la plataforma |
| Botón "Ingresar" activo antes del horario | Validar con timestamp del servidor, no del cliente |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Nombre del usuario | `Usuarios.NombreCompleto` |
| KPI — Próximas citas | `COUNT(Citas)` donde `UsuarioId` y `Estado = Programada` y `FechaHora >= Hoy` |
| KPI — Eventos inscritos | `COUNT(Inscripciones)` donde `UsuarioId` y `Estado = Confirmada` y evento vigente |
| KPI — Profesionales seguidos | `COUNT(Seguidores)` donde `UsuarioId` |
| KPI — Mensajes sin leer | `COUNT(Mensajes)` donde `DestinatarioId = UsuarioId` y `Leido = false` |
| Próxima cita | `Citas` (UsuarioId, Estado = Programada, TOP 1 por FechaHora ASC) |
| Eventos recomendados | `Salas` + `Eventos` (activos, afinidad o popularidad, TOP 3) |
| Profesionales sugeridos | `Profesionales` (no seguidos por el usuario, ORDER BY rating DESC) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Carga del dashboard | Menos de **2 segundos** |
| KPIs correctos | Los 4 valores coinciden con la base de datos en tiempo real |
| Próxima cita visible | Se muestra la cita más cercana con datos correctos |
| "Ingresar" condicional | Solo activo el día de la cita |
| Recomendaciones relevantes | Se muestran 3 eventos y profesionales según afinidad o popularidad |

---

*Documento refinado v2 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*

---

## 1. Problema

El usuario autenticado necesita una vista central que le muestre de un vistazo sus actividades más relevantes (eventos inscritos, próximas citas, sala más próxima) y le permita descubrir y explorar salas disponibles de forma eficiente.

---

## 2. Apetito

**1 a 2 semanas.**
Dashboard del usuario con resumen de actividades, galería de salas activas con filtros y búsqueda, tarjetas de sala con acciones disponibles.

---

## 3. Límites

### ✅ Dentro del scope

- Resumen de actividad del usuario (eventos registrados, próximas citas, sala más próxima)
- Galería de tarjetas de salas activas con eventos vigentes
- Filtros: por categoría de sala, por fecha de inicio
- Búsqueda: por nombre de usuario o nombre de sala
- Sección de salas destacadas (más solicitadas)
- Sección de salas que comienzan hoy
- Tarjeta de sala con información completa y acciones disponibles
- Paginación de 10 registros por página en listados

### ❌ Fuera del scope (No-Gos)

- Modal de detalle de sala (corresponde al módulo `DetalleSala`)
- Proceso de inscripción y pago (corresponde al módulo `InscripcionPago`)
- Envío de mensajes al profesional (corresponde al módulo de mensajería)
- Dashboard del Profesional (es una vista independiente)

---

## 4. Solución Visible

### Sección superior — Resumen de actividad

| Elemento | Descripción |
|---|---|
| Mis eventos registrados | Cantidad y acceso rápido a los eventos en los que el usuario está inscrito |
| Próximas citas | Citas privadas agendadas próximamente |
| Sala más próxima | Fecha y hora de la sala más cercana en la que está inscrito (`8 Oct 2026 3PM`) |

### Sección de filtros y búsqueda

| Elemento | Descripción |
|---|---|
| Filtro por categoría de sala | Lista desplegable con las categorías disponibles |
| Búsqueda por nombre | Campo de texto para buscar por nombre de sala o nombre de profesional |
| Búsqueda por fecha de inicio | Selector de fecha en formato `DD MMM YYYY` |

### Secciones especiales

| Sección | Descripción |
|---|---|
| Salas destacadas | Las salas con mayor número de inscritos activos |
| Salas que comienzan hoy | Salas cuyo evento inicia en la fecha actual |

### Tarjeta de sala

| Campo | Descripción |
|---|---|
| Nombre de la sala | Título principal de la sala |
| Fecha y hora de inicio y fin | Formato `8 Oct 2026 3PM` |
| Usuarios registrados | Número actual de inscritos |
| Cupo máximo | Capacidad total de la sala |
| Precio | Monto de inscripción o "Entrada libre" si es gratuita |
| Nombre del orador | Profesional que dirige la sala |
| Me gusta | Contador de reacciones de la sala |
| Botón "Ver más" | Abre modal con el detalle completo de la sala |
| Botón "Registrarse" | Inicia el proceso de inscripción al evento |
| Botón "Enviar mensaje" | Abre el flujo de mensaje privado al profesional |

---

## 5. Acciones del Usuario

| Acción | Resultado |
|---|---|
| Aplicar filtro por categoría | La galería muestra solo las salas de esa categoría |
| Buscar por nombre | La galería filtra salas y profesionales que coincidan |
| Buscar por fecha | La galería muestra salas con inicio en la fecha seleccionada |
| Hacer clic en "Ver más" | Abre el modal de detalle de la sala |
| Hacer clic en "Registrarse" | Inicia el flujo de inscripción y pago |
| Hacer clic en "Enviar mensaje" | Inicia el flujo de mensaje al profesional |
| Navegar entre páginas | Paginación de 10 salas por página |

---

## 6. Restricciones

- Solo se muestran salas con eventos **abiertos y vigentes** en el momento de la consulta.
- Las salas sin eventos activos **no aparecen** en el listado.
- El usuario solo ve salas a las que puede inscribirse (cupos disponibles o en lista de espera, según se defina).
- La paginación de listados es de **10 registros por página**.

---

## 7. Reglas de Negocio

| Regla | Detalle |
|---|---|
| Visibilidad de salas | Solo salas con eventos abiertos y vigentes son mostradas |
| Sala más próxima | Se calcula entre todas las salas inscritas del usuario; se muestra la de fecha más cercana |
| Salas destacadas | Se ordenan por número de inscritos (descendente); se muestran las primeras |
| Salas de hoy | Se filtran por fecha de inicio igual a la fecha actual del servidor |
| Paginación | 10 registros por página en todos los listados |
| Fecha de inicio | Se muestra en formato `DD MMM YYYY H[MM]AM/PM` |
| Precio | Si el evento es gratuito se muestra "Entrada libre"; si es de pago, el monto en la moneda configurada |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Muchas salas activas generan carga lenta | Aplicar paginación y caché de listados con tiempo de expiración corto |
| Sala más próxima incorrecta si el usuario no tiene inscripciones | Mostrar un mensaje alternativo: "No tienes salas próximas" |
| Filtros combinados pueden no retornar resultados | Mostrar mensaje vacío claro: "No se encontraron salas con los filtros aplicados" |

---

## 9. Datos Necesarios

| Dato | Tabla / Campo |
|---|---|
| Eventos inscritos del usuario | `Inscripciones` (UsuarioId, EventoId, Estado = Confirmado) |
| Próximas citas | `Citas` (UsuarioId, FechaHora, Estado = Programada) |
| Sala más próxima | `Salas` + `Inscripciones` (FechaInicio más cercana, UsuarioId) |
| Salas activas con eventos vigentes | `Salas` + `Eventos` (Estado = Abierto, FechaFin >= Hoy) |
| Categoría de sala | `Salas.Categoria` |
| Información del orador | `Profesionales.Alias`, `Profesionales.NombreCompleto` |
| Número de inscritos | `Inscripciones` (COUNT por EventoId) |
| Cupo máximo | `Salas.CupoMaximo` |
| Precio | `Salas.Precio` (0 = gratuito) |
| Reacciones (me gusta) | `MeGusta` (COUNT por SalaId) |

---

## 10. Métricas de Éxito

| Métrica | Criterio |
|---|---|
| Carga del Dashboard | Menos de **2 segundos** |
| Resumen de actividad correcto | Los datos de eventos, citas y sala más próxima coinciden con la base de datos |
| Filtros funcionales | Los filtros de categoría, nombre y fecha retornan resultados correctos |
| Paginación correcta | Cada página muestra máximo 10 salas |
| Sala más próxima calculada | Se muestra la fecha más cercana de las salas inscritas |

---

*Documento refinado v1 | Mayo 2026 | Metodología [Shape Up – Basecamp](https://basecamp.com/shapeup)*
