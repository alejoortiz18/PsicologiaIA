# Trébol — Documento de producto

> **Propósito de este documento:** describir de forma clara y completa qué es la aplicación Trébol, cómo funciona y qué capacidades ofrece.  
> **Fuentes:** documentación de producto en `Documentos/Funciones` y `Documentos/Requerimientos`, complementada con la definición de negocio confirmada para este documento.  
> **Idioma de la plataforma:** español (Colombia).  
> **Versión del documento:** 1.0 · Julio 2026

---

## 1. Qué es Trébol

**Trébol** es una plataforma web de **telepsicología y bienestar emocional** que conecta:

- personas que buscan apoyo psicológico o asesoría;
- profesionales certificados en salud mental;
- espacios públicos de bienestar (salas y eventos / conferencias);
- sesiones privadas pagas;
- una comunidad profesional especializada (colegas, derivaciones, directorio).

En una frase:

> Trébol es una plataforma digital de atención psicológica que conecta profesionales certificados en salud mental con personas que buscan acompañamiento terapéutico o asesoría, en un entorno seguro, escalable y éticamente responsable.

No es solo un directorio de psicólogos ni solo un chat. Es un **ecosistema completo** donde el usuario descubre profesionales, agenda y paga citas, se inscribe a eventos, entra a salas en vivo, mensajearse con profesionales y, si lo desea, llevar un proceso de acompañamiento con seguimiento clínico; y donde el profesional opera su práctica digital (agenda, salas, ingresos, red de colegas).

---

## 2. Para qué se creó

Trébol nace para resolver, en un solo lugar, la fricción entre **necesidad de apoyo emocional** y **acceso a profesionales verificados**, con estas intenciones de producto:

| Intención | Qué significa en la práctica |
|---|---|
| Acceso a ayuda | Que una persona pueda encontrar profesionales, eventos y citas sin depender de canales informales. |
| Confianza | Que solo operen profesionales con documentación verificada (identidad y tarjeta profesional; validación ante COLPSIC en el modelo de producto). |
| Privacidad | Que el usuario pueda elegir anonimato (alias) cuando la atención es de tipo **asesoría**. |
| Continuidad clínica | Que, cuando el usuario elige **tratamiento / atención psicológica**, exista trazabilidad y seguimiento por parte del profesional. |
| Espacios colectivos | Que existan salas y conferencias (gratuitas o pagas) sobre temas de bienestar, no solo la cita 1 a 1. |
| Monetización clara | Que el profesional cobre por su trabajo y la plataforma retenga su participación de forma parametrizable. |
| Operación controlada | Que la comunicación sensible ocurra dentro de la plataforma (no se fomenta el contacto externo no regulado). |

En resumen: **Trébol se creó para profesionalizar y digitalizar el encuentro entre quien necesita apoyo y quien está certificado para brindarlo**, con reglas claras de privacidad, pago y operación.

---

## 3. Alcance geográfico y roles de la aplicación

### 3.1 Cobertura y monedas

| Aspecto | Definición |
|---|---|
| **Operación inicial** | **Colombia** |
| **Tipo de aplicación** | Aplicación **web**: accesible desde otros países |
| **Moneda en Colombia** | Operación documentada en **COP** (pesos colombianos) |
| **Otros países** | El cobro puede expresarse en **dólares (USD)**; ese esquema de cobro lo **define el administrador** de la plataforma |

### 3.2 Roles dentro de la plataforma

La aplicación distingue tres roles con permisos y pantallas propias:

| Rol | Descripción | Funciones principales en la app |
|---|---|---|
| **Usuario / Paciente** | Cuenta de quien recibe acompañamiento psicológico o asesoría | Directorio, citas, eventos, pagos, salas, mensajería, perfil y saldos |
| **Profesional** | Cuenta de psicólogo o terapeuta certificado | Agenda, salas, citas, conferencias, red de colegas, ingresos y cobros |
| **Administrador** | Cuenta de operación interna de la plataforma | Verificación de profesionales, parámetros de negocio, finanzas y soporte según el módulo admin |

---

## 4. Dos formas de atención: asesoría vs tratamiento psicológico

Esta distinción es **central** en el modelo de Trébol y debe entenderse con claridad.

### 4.1 Asesoría

- El usuario puede adquirir un servicio de **asesoría**.
- Permite tener una cita con un profesional **sin exponer sus datos personales** al profesional (anonimato / alias).
- Al ser asesoría, el profesional **no está obligado** a llevar un **seguimiento psicológico** de ese usuario como paciente en tratamiento.
- Es la vía adecuada para orientación puntual, consulta exploratoria o quien prioriza privacidad.

### 4.2 Atención / tratamiento psicológico

- El usuario que desea **llevar un tratamiento psicológico** entra en una relación de acompañamiento con trazabilidad clínica.
- El profesional puede llevar historial, recomendaciones y seguimiento.
- Un psicólogo puede **remitir** al usuario a otro profesional de la salud cuando el caso lo requiera (por ejemplo, **psiquiatra** u otra profesión pertinente), compartiendo solo la información que el profesional considere adecuada.

### 4.3 Cómo se ve en la experiencia

- En la cita, el usuario puede controlar si muestra **nombre real** o **alias** (especialmente relevante en asesoría).
- En conferencias, las preguntas de asistentes son anónimas para el resto del público; el ponente puede ver el alias del remitente.
- El usuario no se comunica con otros usuarios: solo con profesionales (regla de producto).

---

## 5. Pilares de valor (por qué Trébol es diferente)

| Pilar | Descripción |
|---|---|
| **Anonimato opcional** | El usuario decide si interactúa con nombre real o alias. |
| **Seguridad emocional** | Entorno controlado y moderado para salud mental. |
| **Validación profesional real** | Documentación verificada; modelo con validación COLPSIC. |
| **Telepsicología moderna** | Citas privadas, conferencias en vivo, seguimiento digital. |
| **Espacios públicos de bienestar** | Salas y eventos temáticos, no solo la consulta privada. |
| **Monetización clara** | Precios del profesional + participación de la plataforma definida por administración. |
| **Comunidad profesional** | Directorio, mentores/seguidores, colegas y derivaciones. |

---

## 6. Cómo funciona el negocio (modelo económico)

### 6.1 Quién define los precios al usuario

| Concepto | Quién lo define |
|---|---|
| Valor de la **cita** (lo que el usuario paga al profesional por la sesión) | **Cada profesional** (por ejemplo, valor por hora / tarifa de sesión) |
| Precio de **entrada a una sala / evento** | **Cada profesional** al crear o configurar la sala (puede ser gratuita o de pago) |

### 6.2 Qué cobra la plataforma al profesional

El **administrador** de la aplicación define el **porcentaje** que el profesional debe pagar a la plataforma:

- **por cada sala** (servicio de la plataforma asociado a salas/eventos);
- **por cada cita** que el profesional tenga en la plataforma.

Es decir: el profesional fija el precio de su servicio al usuario; la plataforma retiene su participación según parámetros que configura el administrador.

### 6.3 Otros parámetros financieros documentados en el producto

Además del esquema anterior, la documentación de producto contempla parámetros configurables en el sistema, entre ellos:

| Parámetro (documentado) | Rol en el modelo |
|---|---|
| Tarifa de servicio en pagos de cita / inscripción de pago | Cargo adicional de plataforma en el checkout del usuario (documentado históricamente como valor fijo en COP en configuración) |
| Comisión sobre pagos de eventos | Porcentaje retenido por la plataforma sobre pagos de eventos (configurable) |
| Comisión por retiro de saldo del usuario a cuenta bancaria | Porcentaje aplicado al desembolso (configurable) |
| IVA aplicable a citas | Configurable por administración en la operación de la plataforma |

Los valores concretos de porcentajes y tarifas los **administra la plataforma**; no son negociables por el usuario final en el checkout.

### 6.4 Flujo de dinero (visión de negocio)

```text
Usuario paga cita o inscripción
        │
        ▼
 Pasarela de pago (métodos abajo)
        │
        ├── Parte correspondiente al profesional (según su tarifa / precio de sala)
        └── Participación de Trébol (porcentajes / tarifas definidos por el administrador)

Profesional configura cuenta(s) bancaria(s)
        │
        ▼
 Plataforma liquida / paga al profesional el saldo a favor
 (según políticas de comisión y liquidación del módulo financiero)
```

### 6.5 Métodos de pago disponibles para el usuario

El usuario puede pagar con los métodos contemplados en el producto:

| Método | Descripción breve |
|---|---|
| **Tarjeta de crédito** | Pago con tarjeta (Visa, Mastercard, Amex, según pasarela) |
| **Tarjeta débito** | Débito a través de la pasarela |
| **PSE** | Pagos Seguros en Línea (banca colombiana) |
| **Efecty** | Pago en punto Efecty mediante código / referencia |
| **Nequi** | Pago por billetera Nequi (incluido en flujos de producto) |
| **Transferencia bancaria** | Cuando el flujo de inscripción/pago lo habilita |
| **Saldo a favor** | Crédito interno del usuario en la plataforma (devoluciones, recargas u otros abonos), usable en compras posteriores; puede combinarse con pasarela |

> La plataforma **no almacena** los datos sensibles de tarjeta: el procesamiento se delega a la pasarela. La comunicación va cifrada (SSL).

### 6.6 Pasarelas de pago con las que cuenta la aplicación

Según la arquitectura y el diseño de integración de pagos del proyecto, Trébol contempla operación con:

| Pasarela | Uso |
|---|---|
| **PayU** | Integración de cobros en línea |
| **Mercado Pago** | Integración de cobros en línea |

Estas pasarelas habilitan los métodos anteriores según el país, la moneda (COP / USD según configuración administrativa) y el producto contratado con cada proveedor.

### 6.7 Forma de pago de la plataforma a los profesionales

1. El profesional configura **cuenta(s) bancaria(s)** para recibir pagos.
2. La plataforma acumula el **saldo a favor del profesional** (ingresos por citas y/o eventos, netos de la participación de Trébol).
3. El profesional puede consultar en su panel: ingresos, total cobrado vía la aplicación y **valor del próximo pago / saldo pendiente**.
4. La **liquidación y el desembolso** hacia el profesional los opera la plataforma (módulo financiero / administración), aplicando las políticas de comisión definidas por el administrador.
5. El administrador gestiona **comisiones, liquidaciones y pagos a profesionales**.

En paralelo, el **usuario** también puede tener saldo a favor y solicitar **retiro** a su cuenta bancaria (con comisión de retiro configurable y tiempos de tránsito definidos en el módulo de saldos).

---

## 7. Actores y recorrido de valor

### 7.1 Usuario / Paciente — recorrido típico

1. Llega a la **landing** pública y entiende la propuesta.
2. Se **registra** (o inicia sesión) y confirma su cuenta.
3. Entra a su **inicio (home)**: citas, eventos, accesos rápidos.
4. Explora el **directorio** (médicos/especialistas, psicólogos) y puede seguir **mentores**.
5. Agenda una **cita** (asesoría o atención psicológica), elige horario en el calendario del profesional y **paga**.
6. Se inscribe a **eventos / salas** (gratis o de pago) y asiste a **conferencias**.
7. Usa **mensajería** con profesionales, gestiona **perfil**, **agenda** y **saldos**.
8. En sala de cita: cámara, audio, chat, control de alias, notas privadas y recomendaciones del profesional.

### 7.2 Profesional — recorrido típico

1. Se **registra** con datos personales, especialidades, documentos (identidad y tarjeta profesional en PDF) y número de tarjeta profesional.
2. Confirma correo; la solicitud queda en **revisión**.
3. El **administrador aprueba o rechaza**; si aprueba, el profesional puede operar.
4. Completa **perfil** (información, estudios, idiomas, foto, valor por hora, cuentas bancarias).
5. Configura **calendario** (disponibilidad y bloqueos).
6. Crea y gestiona **salas / eventos**, atiende **citas**, abre **salas privadas** y **conferencias**.
7. Construye red: **seguidores**, **colegas**, **derivaciones**.
8. Consulta **indicadores e ingresos**.

### 7.3 Administrador — recorrido típico

1. Inicia sesión en el módulo admin.
2. Revisa la **bandeja** de solicitudes de profesionales (aprobar / rechazar con motivo).
3. Configura parámetros de la plataforma (porcentajes por sala y por cita, IVA y demás claves de configuración).
4. En la visión completa del producto: finanzas, moderación, soporte, auditoría y métricas globales.

---

## 8. Mapa de la aplicación (vistas y módulos)

A continuación se describe **qué pantallas / módulos existen en el producto**, agrupados por rol. Este es el mapa funcional de Trébol.

### 8.1 Público (sin sesión)

| Módulo / vista | Para qué sirve |
|---|---|
| **Landing page** | Presentar la marca, generar confianza, mostrar especialidades, eventos destacados y estadísticas; convertir a registro o login |
| **Login** | Autenticación; maneja también estados de cuenta (sin confirmar, en revisión, rechazado) |
| **Selección de perfil** | Elegir registro como Usuario o como Profesional |
| **Registro de usuario** | Alta de cuenta de paciente/usuario |
| **Registro de profesional** | Alta con documentos y datos profesionales |
| **Confirmación de correo / activación** | Validar identidad de correo y activar cuenta |
| **Espera / reenvío** | Flujos de espera de confirmación o reenvío de documentos/correo |
| **Recuperación de contraseña** | Solicitar y restablecer acceso |
| **Catálogo de ciudades** | Apoyo a formularios (ciudades según país) |

### 8.2 Usuario autenticado

| Módulo / vista | Para qué sirve |
|---|---|
| **Home usuario** | Panel del día: citas, eventos, accesos |
| **Eventos** | Catálogo de eventos públicos para explorar e inscribirse |
| **Directorio — Médicos / Especialistas** | Buscar profesionales tipo médico/especialista |
| **Directorio — Psicólogos** | Buscar psicólogos (con señales de verificación COLPSIC en producto) |
| **Mis mentores** | Profesionales que el usuario sigue |
| **Mis citas** | Listado, detalle, cancelación, ingreso a sala |
| **Nueva cita / pago de cita** | Agendar y pagar (checkout) |
| **Sala de cita (usuario)** | Sesión privada en vivo (video/audio/chat según diseño) |
| **Mis eventos** | Eventos en los que está inscrito (vigentes / cerrados) |
| **Inscripción / checkout de evento** | Wizard de inscripción y pago |
| **Conferencia (asistente)** | Sala de conferencia como participante |
| **Mensajes** | Conversaciones con profesionales |
| **Perfil de usuario** | Datos, agenda, saldos, novedades y configuración |
| **Perfil orador (público)** | Ver el perfil público de un profesional (salas, calendario, comentarios) |
| **Novedades** | Avisos operativos (por ejemplo, cambios de cita) que el usuario debe resolver |

**Menú lateral típico del usuario:** Inicio · Eventos · Profesionales (Médicos, Psicólogos, Mis mentores) · Mis citas · Mis eventos · Mensajes · Mi perfil.

### 8.3 Profesional autenticado

| Módulo / vista | Para qué sirve |
|---|---|
| **Home profesional** | Operación del día: citas, eventos, indicadores de actividad |
| **Mis eventos** | Gestión de salas/eventos propios |
| **Eventos inscritos** | Eventos de otros a los que el profesional se inscribe como participante |
| **Directorio** | Médicos, Psicólogos, Mis colegas |
| **Mi perfil (5 pestañas)** | Información personal · Salas · Calendario · Citas · Indicadores (KPI) |
| **Calendario / disponibilidad** | Horarios disponibles y bloqueos |
| **Citas del profesional** | Próximas e historial; ingreso a sala |
| **Salas — crear / editar / detalle** | Administración de salas y eventos |
| **Sala privada (profesional)** | Atención 1 a 1 en vivo |
| **Sala de conferencia (profesional)** | Ponencia en vivo, preguntas, asistentes, controles |
| **Mensajes** | Inbox con usuarios y otros profesionales |
| **Perfil orador / mis salas** | Vista pública y gestión asociada al perfil de orador |
| **Pagos e ingresos (visión de producto)** | Control de ingresos, comisiones y datos bancarios |

**Menú lateral típico del profesional:** Inicio · Mis eventos · Eventos inscritos · Profesionales (Médicos, Psicólogos, Mis colegas) · Mi perfil · Citas · Mensajes.

### 8.4 Administrador

| Módulo / vista | Para qué sirve |
|---|---|
| **Bandeja de notificaciones** | Revisar y resolver solicitudes de registro profesional (aprobar / rechazar) |
| **Configuración** | Parámetros de plataforma (por ejemplo IVA y claves financieras) |
| **Finanzas (visión completa)** | Comisiones, liquidaciones y pagos a profesionales |
| **Moderación / soporte / auditoría / métricas (visión completa)** | Operación, control y crecimiento de la plataforma |

### 8.5 Componentes transversales de experiencia

- Layout interno con menú lateral según rol.
- Notificaciones en barra superior.
- Modales del sistema (confirmaciones, errores, avisos) — sin diálogos nativos del navegador.
- Tablas con paginación.
- Toasts de feedback no bloqueante.
- Factura / comprobante de inscripción cuando aplica.

---

## 9. Entidades de negocio (qué “cosas” gestiona Trébol)

Lenguaje de negocio, no técnico. Cada entidad es un activo o registro que la plataforma administra.

### 9.1 Catálogos maestros

| Entidad | Qué representa |
|---|---|
| **País** | Países disponibles en formularios y ubicación |
| **Ciudad** | Ciudades ligadas a un país |
| **Especialidad** | Especialidades de salud mental / áreas de práctica |
| **Categoría** | Categorías de salas/eventos |
| **Idioma** | Idiomas que domina un profesional |
| **Configuración** | Parámetros globales (comisiones, tarifas, IVA, etc.) |

### 9.2 Personas y acceso

| Entidad | Qué representa |
|---|---|
| **Usuario** | Paciente / persona que consume servicios |
| **Profesional** | Prestador certificado (con documentos, especialidades, estudios, idiomas) |
| **Administrador** | Operador interno |
| **Tokens** (validación, activación, recuperación) | Seguridad de alta de cuenta y recuperación de acceso |
| **Sesión** | Control de sesión autenticada |

### 9.3 Oferta del profesional

| Entidad | Qué representa |
|---|---|
| **Horario disponible** | Franjas en las que se puede agendar |
| **Horario bloqueado** | Franjas no disponibles |
| **Cuenta bancaria** (profesional) | Destino de liquidaciones |
| **Sala** | Contenedor temático de bienestar / orientación |
| **Evento** | Ocurrencia concreta de una sala (fecha/hora, cupos, precio) |
| **Mensaje de evento** | Interacción en el contexto del evento |

### 9.4 Citas y clínica

| Entidad | Qué representa |
|---|---|
| **Cita** | Sesión privada agendada (asesoría o atención psicológica) |
| **Pago de cita** | Transacción asociada a la cita |
| **Recomendación** | Orientaciones del profesional al usuario |
| **Nota / comentario privado** | Registros privados según reglas de visibilidad |
| **Historial clínico** (visión de producto) | Seguimiento psicológico del paciente en tratamiento |
| **Asistencia a cita** | Control de ingreso / inasistencia |

### 9.5 Inscripciones y pagos de eventos

| Entidad | Qué representa |
|---|---|
| **Inscripción** | Cupo del usuario (o profesional participante) en un evento |
| **Pago de inscripción** | Transacción de entrada al evento |
| **Presencia en conferencia** | Quién está conectado / asistencia |
| **Extensión de tiempo / minutos extra** | Compra de tiempo adicional en conferencia cuando aplica |

### 9.6 Red social profesional

| Entidad | Qué representa |
|---|---|
| **Seguidor** | Usuario que sigue a un profesional (mentor) |
| **Colaboración profesional** | Vínculo de colegas |
| **Comentario a profesional** | Opiniones / valoraciones en perfil público |
| **Conversación / mensaje privado** | Mensajería 1 a 1 |
| **Notificación** | Avisos del sistema a usuarios, profesionales o admin |

### 9.7 Finanzas del usuario

| Entidad | Qué representa |
|---|---|
| **Cuenta bancaria del usuario** | Destino de retiros |
| **Movimiento de saldo** | Abonos y cargos del saldo interno |
| **Saldo / recarga** | Crédito a favor del usuario |
| **Ajuste de saldo del profesional** | Contrapartida cuando hay créditos/devoluciones que afectan al profesional |
| **Novedad de usuario** | Eventos operativos que requieren respuesta (p. ej. reagendar) |

---

## 10. Capacidades clave por dominio

### 10.1 Confianza y onboarding profesional

- Registro con documentos PDF (identidad y tarjeta profesional).
- Revisión humana en bandeja de administración.
- Activación solo tras aprobación.
- Señales de verificación (p. ej. badge / COLPSIC) en directorio y perfiles.

### 10.2 Descubrimiento

- Landing con especialidades y eventos destacados.
- Directorios filtrables.
- Perfil público del orador/profesional (salas, calendario, comentarios).
- Mentores (usuario) y colegas (profesional).

### 10.3 Agenda y citas

- Calendario del profesional con disponibilidad y bloqueos.
- Agendamiento con pago previo.
- Tipos de atención: asesoría (anonimato, sin obligación de seguimiento) vs tratamiento psicológico (seguimiento y posible remisión).
- Sala privada en vivo.
- Cancelaciones, novedades y reglas de inasistencia según producto.

### 10.4 Salas, eventos y conferencias

- Creación de salas temáticas y eventos.
- Inscripción gratuita o paga.
- Conferencia en vivo: preguntas, lista de asistentes, controles del ponente.
- Extensión de tiempo cuando el producto lo permite.

### 10.5 Mensajería y comunidad

- Chat privado usuario↔profesional y profesional↔profesional.
- Prohibición de mensajería usuario↔usuario.
- Políticas contra contacto fuera de plataforma (multas / sanciones en reglas de producto).

### 10.6 Dinero

- Checkout de citas e inscripciones.
- Saldos del usuario y retiros.
- Ingresos y liquidaciones del profesional.
- Parámetros financieros administrables.

---

## 11. Administración y gobernanza de la plataforma

El administrador es quien **parametriza el negocio digital**:

- aprueba o rechaza profesionales;
- define **porcentajes** que el profesional paga a la plataforma **por sala** y **por cita**;
- define esquemas de cobro en **COP** y, para uso internacional, en **USD**;
- configura otros parámetros (IVA, comisiones de retiro, etc.);
- en la visión completa: finanzas, moderación, soporte, auditoría y métricas.

Sin este rol, Trébol no puede garantizar calidad de oferta (quién atiende) ni sostenibilidad económica (cómo se reparte el valor).

---

## 12. Tecnología (visión para negocio)

Trébol está construido como aplicación **web** moderna, pensada para escalar usuarios, salas y sesiones:

| Capa | Enfoque |
|---|---|
| Aplicación | ASP.NET Core MVC (.NET 10) |
| Datos | SQL Server (`TrebolDB`), lógica transaccional en procedimientos almacenados |
| Tiempo real | Señalización en vivo para chat y salas (hubs en tiempo real) |
| Seguridad | Contraseñas con hash Argon2; sesión por cookie segura; anti-falsificación en formularios |
| Pagos | Integración con pasarelas **PayU** y **Mercado Pago** |
| Experiencia | Interfaz alineada a prototipo de producto, en español de Colombia |

En conjunto: no es un prototipo de presentación estática; es una **plataforma transaccional** con roles, pagos, agenda, salas y operación administrativa.

---

## 13. Qué problema de mercado atiende (síntesis ejecutiva)

| Problema | Respuesta de Trébol |
|---|---|
| Dificultad para encontrar profesionales confiables | Directorio + verificación documental / COLPSIC |
| Miedo a exponerse al pedir ayuda | Asesoría con alias / anonimato |
| Necesidad de continuidad terapéutica | Tratamiento con seguimiento y posible remisión |
| Falta de espacios formativos/colectivos | Salas y conferencias temáticas |
| Informalidad en cobros y citas | Agenda + pasarela + liquidación a profesionales |
| Contacto desordenado fuera de canal | Mensajería y reglas dentro de la plataforma |

---

## 14. Síntesis de la aplicación

**Trébol** es una plataforma de telepsicología con operación inicial en **Colombia**, accesible vía web desde otros países y con cobros en **USD** cuando así lo configure la administración. Une en un solo producto:

1. **confianza** (profesionales verificados),  
2. **privacidad** (asesoría anónima),  
3. **continuidad clínica** (tratamiento y remisiones),  
4. **comunidad y contenido en vivo** (salas/eventos), y  
5. **monetización clara** (el profesional fija su precio; el administrador define la participación de Trébol por cita y por sala; el usuario paga con métodos locales y pasarelas PayU / Mercado Pago; la plataforma liquida a los profesionales).

Eso es, en esencia, **para qué se creó Trébol**: convertir el acceso a la salud mental en un servicio digital completo, ético y económicamente sostenible para usuarios, profesionales y la propia plataforma.

---

## 15. Glosario breve

| Término | Significado en Trébol |
|---|---|
| **Usuario** | Persona que busca asesoría o tratamiento |
| **Profesional** | Prestador certificado de salud mental |
| **Asesoría** | Atención puntual con anonimato; sin obligación de seguimiento clínico |
| **Tratamiento psicológico** | Acompañamiento con seguimiento; posible remisión a otras profesiones de la salud |
| **Sala** | Espacio temático creado por un profesional |
| **Evento** | Sesión concreta de una sala |
| **Cita** | Sesión privada 1 a 1 |
| **Mentor** | Profesional seguido por un usuario |
| **Colega** | Profesional vinculado a otro profesional |
| **Saldo a favor** | Crédito interno usable en la plataforma |
| **Liquidación** | Pago de la plataforma al profesional |

---

*Documento elaborado para presentación de producto. No incluye credenciales ni datos de entornos de prueba.*
