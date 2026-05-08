# Plan de subsanación SEPE — Reproductor SCORM y plataforma

Este plan agrupa el trabajo en 4 bloques. Es extenso, así que lo ejecutaré por fases para que puedas validar cada hito antes de continuar.

---

## Bloque 1 — SCORM + Calificaciones + Móvil

**1.1 Reproductor SCORM robusto (scorm-again)**
- Sustituir la API SCORM artesanal (`scorm12-api.ts`) por la librería `scorm-again` (estándar del sector, soporta SCORM 1.2 y 2004).
- Exponer `window.API` (1.2) y `window.API_1484_11` (2004) desde el componente padre del iframe.
- Conectar los callbacks `LMSCommit`/`LMSFinish` a `saveScormProgress` (ya existe) escribiendo `cmi.core.score.raw`, `lesson_status`, `session_time`.
- Garantizar que `cmi.core.score.raw ≥ score_min` actualice también `enrollments.grade` y dispare `notify_grade_published`.

**1.2 Vista permanente de calificaciones del alumno**
- Nueva ruta `/dashboard/student/grades` (o ampliar `StudentEvaluations`) con:
  - Tabla por curso → módulo → actividad/evaluación/SCORM.
  - Columnas: nota, intentos, fecha, estado (aprobado/no apto), enlace al recurso.
- Fuente: `evaluation_attempts`, `activity_submissions`, `scorm_progress`.

**1.3 Compatibilidad móvil (Galaxy Tab Chrome / iPad Safari)**
- Reproductor responsive: layout flex/grid con breakpoints, sidebar colapsable en `<md`, iframe con `100dvh` para evitar el bug de barra Safari.
- Forzar `playsinline`, `allow="autoplay; fullscreen"` en iframe.
- Service Worker: `updateViaCache:'none'` ya aplicado; añadir fallback no-SW para iOS antiguo (sirve blobs vía `URL.createObjectURL` en iframe `srcdoc`).
- QA: verificar con viewport 800×1280 (Tab) y 820×1180 (iPad).

---

## Bloque 2 — Trazabilidad SEPE

**2.1 Registro de permanencia por recurso (migration)**
- Tabla `resource_access_log`:
  - `user_id`, `enrollment_id`, `course_id`, `module_id`, `unit_id`, `resource_type` (scorm/pdf/video/quiz), `resource_id`,
  - `entered_at`, `left_at`, `active_seconds` (heartbeat),
  - `ip_address`, `user_agent`.
- RLS: alumno escribe lo suyo; tutor/admin lee de su centro.
- Hook `useResourceTracker(resourceId, type)` con heartbeat 30s, pausa cuando `document.hidden`.

**2.2 Barra de progreso por módulo formativo en tiempo real**
- Componente `<ModuleProgressBar moduleId>` que calcula:
  `% = (unidades completadas + actividades aprobadas + SCORM lesson_status='completed') / total`.
- Usar `supabase.channel().on('postgres_changes', ...)` en `unit_progress` y `scorm_progress` para refresco en vivo.
- Insertar en cabecera de `ModuleView` y en `StudentCourses`.

**2.3 Caducidad de sesión por inactividad**
- Ya existe `useIdleTimeout` (25 min aviso / 30 min logout). Conectarlo en `DashboardLayout` para todos los roles de alumno.

---

## Bloque 3 — Layout normativo 80/20

- En `ScormProPlayer` y `ModuleView`:
  - Sidebar de navegación con `w-[20%] max-w-[280px]`, contenido `w-[80%]`.
  - En móvil: sidebar `Sheet` (off-canvas) y contenido a 100%.
- Mapa de navegación permanente: árbol jerárquico Curso → MF → UF → UD con iconos de estado (no iniciado / en curso / completado / aprobado).
- Sticky en desktop, accesible vía botón hamburguesa en móvil.

---

## Bloque 4 — Recursos y soporte

**4.1 Gestor de descargas**
- Auditar `CourseStudentGuide` y `generateStudentGuidePDF` / `generateCIMNavigationGuidePDF`.
- Aplicar el patrón `fetch → Blob → ObjectURL` (memoria del proyecto) para evitar bloqueadores.
- Añadir registro en `resource_access_log` con `resource_type='download'`.

**4.2 Chat y Foro por módulo**
- Componentes ya existentes: `ModuleChat`, `CourseForum`, `TutorForum`, `UnitForum`.
- Integrarlos como tabs dentro de `ModuleView` ("Contenido | Chat | Foro | Glosario") con realtime ya soportado.
- Verificar RLS de `messages`/`forum_posts` por módulo.

**4.3 Glosario con hiperenlaces**
- Componente `<GlossaryTerm term="...">` que abre popover con definición desde `course_glossary`.
- Parser de contenido HTML/Markdown que detecte términos del glosario y los envuelva automáticamente.
- Página `/course/:id/glossary` permanente (ya existe `CourseGlossary`).

---

## Detalles técnicos clave

- **Dependencias nuevas**: `scorm-again` (`bun add scorm-again`).
- **Migraciones**: 1 sola migración con `resource_access_log` + RLS + índices.
- **Sin cambios** en buckets ni en tablas existentes salvo `enrollments.grade` (ya existe).
- **Realtime**: añadir `unit_progress`, `scorm_progress`, `resource_access_log` a `supabase_realtime`.

---

## Orden de ejecución propuesto

1. **Fase A** (esta iteración): Bloque 1.1 + 1.2 + 2.1 + 2.3 (lo más crítico para SEPE).
2. **Fase B**: Bloque 2.2 + 3 (progreso realtime + layout 80/20).
3. **Fase C**: Bloque 1.3 (QA móvil) + Bloque 4 (descargas, chat/foro, glosario).

¿Apruebas el plan y empezamos por la **Fase A**? Si prefieres otro orden o quitar algo, dímelo.
