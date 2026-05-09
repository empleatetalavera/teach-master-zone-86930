## Cambios a aplicar

### 1) CAU – arreglar comportamiento y añadir envío real de correo
**Problema actual:** el botón CAU abre un popover, pero dentro del popover hay un botón "Visita Virtual" que navega a `/campus-guide`. Es probable que estés pulsando ese y por eso "te lleva a la guía". Además, hoy solo guarda en la tabla `communications`, no manda email real.

**Cambios:**
- Convertir el CAU en un **Dialog modal grande** (no popover): título "Centro de Atención al Usuario", el formulario ocupa el centro, sin botón "Visita Virtual" dentro (esos enlaces siguen disponibles en otras pestañas como ya están).
- El botón Enviar:
  1. Inserta el mensaje en `communications` (ya hace esto → queda registrado).
  2. **Manda email real** al `support_email` del centro vía la infraestructura de emails app de Lovable Cloud (sin Resend).
- Si el centro no tiene email configurado, mostrar aviso ("contacta por teléfono") y deshabilitar Enviar.

**Infraestructura email (necesita configuración del usuario una vez):**
- Configurar dominio de envío en Lovable Cloud → diálogo "Set up email domain" (paso único, requiere DNS).
- Crear plantilla `cau-support-message` (subject "Nueva consulta CAU – {courseTitle}", body con asunto, mensaje, datos del alumno, link al adjunto si lo hay).
- Edge Function `send-transactional-email` (la incluye Lovable) hará el envío.

### 2) Foro general del curso
Añadir una nueva **pestaña "Foro"** en `CourseView.tsx` (entre Mensajes/Soporte y Evaluaciones) que renderice `CourseForum` a nivel curso (sin `unitId`). Ya existe el componente con buscador transversal; solo falta exponerlo.

### 3) Subida de evidencias dentro de "Recursos Evaluación"
Mover `EvidenceManager` desde su pestaña "Evidencias" independiente a un bloque destacado dentro del acordeón "Recursos Evaluación" en `SEPEFormacionCampus.tsx`, justo debajo del resumen "para superar el curso deberás:". Eliminar la pestaña suelta "Evidencias".

## Detalles técnicos

- **Dialog CAU:** `Dialog` + `DialogContent className="max-w-2xl"` reemplazando el `Popover`. Eliminar de `CAUSupportForm` los botones "Visita Virtual" y "FAQ".
- **Email:** invocar `supabase.functions.invoke('send-transactional-email', { body: { templateName: 'cau-support-message', recipientEmail: supportEmail, idempotencyKey: \`cau-${commId}\`, templateData: { studentName, courseTitle, subject, message, attachmentUrl } } })`. La plantilla TSX vive en `supabase/functions/_shared/transactional-email-templates/cau-support-message.tsx` y se registra en `registry.ts`.
- **Foro:** nuevo `<TabsTrigger value="forum">Foro</TabsTrigger>` + `<TabsContent value="forum"><CourseForum courseId={courseId!} /></TabsContent>`.
- **Evidencias:** insertar `<EvidenceManager courseId={courseId!} userRole={userRole} />` al final del bloque `Recursos de Evaluación` en `SEPEFormacionCampus.tsx`. Quitar `TabsTrigger` y `TabsContent` `value="evidences"` de `CourseView.tsx`.

## Orden de ejecución
1. Configurar dominio de email (necesita tu acción en el diálogo).
2. Scaffolding email + plantilla CAU + deploy.
3. Refactor del CAU a Dialog + invocación del email.
4. Añadir pestaña Foro.
5. Mover EvidenceManager a Recursos Evaluación y quitar la pestaña suelta.

¿Confirmas que quieres que arranquemos por el **paso 1 (configurar dominio de email)**? Sin eso, los pasos 2 y la parte de email del CAU no pueden completarse, pero sí puedo hacer en paralelo los puntos 3-5 (Dialog, Foro, Evidencias) mientras decides.
