## Objetivo
Replicar en Formación en Campus la estructura oficial de la guía homologada: **A) Introducción al MF/UF** + **B) Desarrollo (CIM + Material complementario + Actividades evaluables + Foros)** + **Biblioteca** del módulo. Estructura siempre visible; los items vacíos muestran "Pendiente de configurar" y, para admin/tutor, botón Añadir/Subir.

## 1. Migración de base de datos

### a) Extender `module_content` (sin cambios de esquema, solo nuevos `content_type`)
Reutilizo la tabla existente. Nuevos valores permitidos en la columna `content_type` (texto libre, ya usable):
- `intro_video` — vídeo de presentación de la UF/MF
- `objectives_pdf` — PDF "Objetivos y contenidos"
- `support_doc` — documento de apoyo (Material complementario)
- `support_video` — vídeo de apoyo
- `support_audio` — audio de apoyo
- `biblioteca` — entrada de biblioteca (a nivel módulo, `formative_unit_id IS NULL`)
- `manual_pdf` — ya existente, sin cambios

No requiere ALTER, pero añado un `CHECK` opcional documental.

### b) `forum_topics` — soporte por UF y categoría
```sql
ALTER TABLE forum_topics
  ADD COLUMN formative_unit_id uuid REFERENCES formative_units(id) ON DELETE CASCADE,
  ADD COLUMN category text NOT NULL DEFAULT 'general';
CREATE INDEX idx_forum_topics_uf ON forum_topics(formative_unit_id);
```
Categorías reconocidas en UI: `sesion_inicial`, `debate`, `dudas_contenido`, `dudas_actividades`, `dudas_tecnicas`, `general`.

### c) `evaluations` — distinguir tipo
```sql
ALTER TABLE evaluations
  ADD COLUMN evaluation_type text NOT NULL DEFAULT 'unit';
-- valores: 'diagnostic' (cuestionario previo), 'unit', 'module', 'final', 'quality_survey', 'tutor_survey'
```

## 2. Estructura visual por UF (acordeón "Unidad Didáctica N")

```text
┌─ INTRODUCCIÓN ────────────────────────────────────────┐
│ 🎬 Vídeo de presentación        [Reproducir] [Subir*]│
│ 📑 Objetivos y Contenidos (PDF) [Abrir]    [Subir*] │
│ 💬 Sesión Inicial (chat)        [Entrar]   [Crear*] │
│ ❓ Cuestionario conocimientos    [Realizar] [Crear*] │
└───────────────────────────────────────────────────────┘
┌─ FORMACIÓN EN CAMPUS ─────────────────────────────────┐
│ 🟪 Contenido Interactivo Multimedia    [Abrir CIM]   │
│ 📘 Manual PDF                          [Abrir/Subir] │
│                                                       │
│ MATERIAL COMPLEMENTARIO                              │
│  📄 Documento de apoyo 1 …                           │
│  🎬 Vídeo de apoyo 1 …                               │
│  🔊 Audio de apoyo 1 …                               │
│  [+ Añadir recurso*]                                  │
│                                                       │
│ ACTIVIDADES DE APRENDIZAJE EVALUABLES                │
│  ✏️ Actividad 1 — …                  [Entregar]     │
│  ✏️ Actividad 2 — …                  [Entregar]     │
│  [+ Nueva actividad*]                                 │
│                                                       │
│ FOROS                                                │
│  💬 Foro de debate (UF)                              │
│  ❓ Foro de dudas/consultas                          │
│                                                       │
│ TEST FINAL DE LA UF                  [Realizar]      │
└───────────────────────────────────────────────────────┘
```
(*) sólo visible para admin/teacher.

Al final del módulo, un bloque **BIBLIOTECA** (recursos `biblioteca` del módulo) con búsqueda por palabra clave.

## 3. Cambios de código

### Componentes nuevos
- `src/components/campus/UFIntroductionSection.tsx` — los 4 items de introducción.
- `src/components/campus/SupplementaryMaterialList.tsx` — lista tipada (doc/vídeo/audio) con iconos diferenciados (azul/rojo/verde como guía).
- `src/components/campus/UFActivitiesList.tsx` — lista todas las actividades de la UF (no sólo una).
- `src/components/campus/UFForumsList.tsx` — debate + dudas con badges por categoría.
- `src/components/campus/ModuleLibrary.tsx` — biblioteca al final del módulo.
- `src/components/campus/AddResourceDialog.tsx` — diálogo único para subir/asociar cualquier `content_type` (intro_video, objectives_pdf, support_*, biblioteca).

### Refactor
- `src/components/campus/SEPEFormacionCampus.tsx` — sustituye los 4 `UnitResourceItem` actuales por las nuevas secciones (Introducción, CIM+Manual, Material complementario, Actividades, Foros, Test). Añade `<ModuleLibrary>` después de las UFs.

### Hooks/datos
- Cargar en CourseView (o hook `useCourseData`) los nuevos arrays:
  - `module_content` filtrado por nuevos `content_type` (lo trae todo y se agrupa en cliente).
  - `forum_topics` por `formative_unit_id` y `category`.
  - `evaluations.evaluation_type` para distinguir diagnostic vs unit vs final.

## 4. Permisos y RLS
- `module_content` ya tiene RLS por curso/centro — sin cambios.
- `forum_topics`: la nueva columna no rompe policies existentes; verifico que insert/select sigan funcionando.
- `evaluations`: idem.

## 5. Fuera de alcance
- No se cambia el SCORM viewer ni el flujo de calificaciones.
- No se cambia la pestaña "Plan de Trabajo / Cronograma".
- No se cambia el componente CertificateCampusLayout (sólo se siguen usando sus pestañas).

## 6. Validación
- Como admin: subir vídeo intro, PDF objetivos, doc apoyo, audio, foro debate; comprobar que el alumno los ve.
- Como alumno: ver "Pendiente de configurar" cuando no hay datos; los items configurados aparecen con el flujo correcto.
- Verificar tipos en `src/integrations/supabase/types.ts` se regeneran tras la migración.
