# Sistema Multi-Tenant - TalentCloudSolution

## Arquitectura del Sistema

TalentCloudSolution funciona como una **plataforma SaaS multi-tenant** que provee servicios LMS a centros de formación.

### Jerarquía de Roles

```
TalentCloudSolution (Proveedor)
├── Super Admin
│   ├── Gestión de Centros de Formación
│   ├── Gestión de Licencias
│   ├── Facturación Global
│   ├── Pedidos de Contenido (todos los centros)
│   └── Análisis Global
│
└── Centros de Formación (Clientes)
    ├── Admin de Centro
    │   ├── Personalización (Branding)
    │   ├── Gestión de Usuarios (su centro)
    │   ├── Gestión de Cursos (su centro)
    │   ├── Solicitudes de Contenido
    │   └── Informes (su centro)
    │
    ├── Profesores
    │   ├── Gestión de Cursos Asignados
    │   ├── Seguimiento de Alumnos
    │   └── Evaluaciones
    │
    └── Alumnos
        ├── Acceso a Cursos
        ├── Evaluaciones
        └── Certificados
```

## Funcionalidades por Rol

### Super Admin (TalentCloudSolution)

#### 1. Gestión de Centros de Formación
- **Crear centros** con configuración completa:
  - Información básica (nombre, contacto, dirección)
  - Branding personalizado (logo, colores)
  - Licencia inicial automática
  
- **Editar centros** existentes
- **Activar/Desactivar** centros
- **Eliminar** centros (con precaución)

#### 2. Gestión de Licencias
- Ver todas las licencias de todos los centros
- Crear licencias adicionales
- Modificar límites (estudiantes, profesores, cursos)
- Establecer precios y duración
- Renovar licencias expiradas

#### 3. Sistema de Pedidos
- Ver **todas las solicitudes** de todos los centros
- Cambiar estado de pedidos:
  - `pending` → `in_progress` → `completed`
  - O marcar como `cancelled`
- Asignar fechas de entrega
- Establecer precios
- Gestionar prioridades

#### 4. Facturación
- Generar facturas por consumo
- Ver historial de pagos
- Exportar informes financieros
- Gestionar métodos de pago

### Admin de Centro

#### 1. Personalización del Centro
- **Acceso**: Dashboard → Mi Centro
- **Puede configurar**:
  - Logo del centro (aparece en login)
  - Colores primario y secundario
  - Insignia oficial (ej: "Centro Acreditado SEPE")
  - Texto del footer
  - Información de contacto

#### 2. Gestión de Usuarios
- Crear usuarios (profesores, alumnos) **solo de su centro**
- Asignar roles
- Ver límites de su licencia:
  - Máximo de profesores
  - Máximo de alumnos
  - Máximo de cursos

#### 3. Solicitudes de Contenido
- **Crear solicitudes** de:
  - Cursos completos
  - Módulos específicos
  - Videos formativos
  - Documentos
  - Contenido personalizado
  
- **Estados de solicitud**:
  - `pending`: Enviada, esperando revisión
  - `in_progress`: En desarrollo por TalentCloudSolution
  - `completed`: Entregado y disponible
  - `cancelled`: Cancelado

- **Limitaciones**:
  - Solo puede editar solicitudes en estado `pending`
  - Solo puede eliminar solicitudes `pending`
  - No puede cambiar precios ni fechas (lo hace super_admin)

#### 4. Gestión de Cursos
- Ver cursos de su centro
- Configurar cursos
- Asignar profesores
- Matricular alumnos (dentro de límite de licencia)

## Flujo de Trabajo: Solicitud de Contenido

### 1. Centro solicita contenido
```
Admin de Centro → Solicitar Contenido → Nueva Solicitud
├── Selecciona tipo de contenido
├── Describe requerimientos
├── Establece prioridad
└── Envía solicitud (estado: pending)
```

### 2. TalentCloudSolution recibe solicitud
```
Super Admin → Pedidos de Contenido
├── Ve todas las solicitudes pendientes
├── Revisa detalles
├── Asigna prioridad
├── Establece precio
├── Define fecha de entrega
└── Cambia estado a: in_progress
```

### 3. Desarrollo y entrega
```
Super Admin → Trabaja en el contenido
├── Puede actualizar estado
├── Puede comunicar progreso
└── Al finalizar: completed
```

### 4. Facturación
```
Super Admin → Facturación
├── Genera factura basada en pedidos completados
├── Incluye precio establecido
└── Envía factura al centro
```

## Flujo de Trabajo: Crear Centro Nuevo

### 1. Super Admin crea el centro
```
Dashboard → Centros de Formación → Nuevo Centro

Pestaña 1: Información Básica
├── Nombre del centro *
├── Email de contacto
├── Teléfono
└── Dirección

Pestaña 2: Personalización
├── Logo (upload)
├── Color Primario (HSL)
├── Color Secundario (HSL)
├── Insignia oficial
└── Texto del footer

Pestaña 3: Licencia (opcional)
├── ✓ Crear licencia inicial
├── Tipo: Básica / Profesional / Enterprise
├── Límites:
│   ├── Máx. alumnos
│   ├── Máx. profesores
│   └── Máx. cursos
├── Duración (meses)
└── Precio (€)
```

### 2. Crear Admin del Centro
```
Dashboard → Usuarios → Nuevo Usuario
├── Email: admin@centro.com
├── Contraseña
├── Nombre completo
├── Rol: Admin
└── Centro de Formación: [Seleccionar]
```

### 3. Admin del Centro configura
```
El admin del centro puede:
1. Iniciar sesión → Ve branding personalizado
2. Personalizar más su centro (Mi Centro)
3. Crear profesores y alumnos
4. Solicitar contenido
5. Gestionar cursos
```

## Branding Personalizado

### ¿Cómo funciona?

1. **Storage**: Logos se guardan en bucket `center-logos` de Supabase
2. **Base de datos**: Tabla `training_centers` contiene:
   - `logo_url`: URL pública del logo
   - `primary_color`: Color principal (HSL)
   - `secondary_color`: Color secundario (HSL)
   - `official_badge`: Texto de insignia
   - `footer_text`: Texto del footer

3. **Aplicación**:
   - Hook `useBranding` carga config del centro del usuario
   - `BrandingProvider` aplica colores a CSS variables
   - `BrandingHeader` muestra logo y badge
   - Login (`/auth`) muestra branding del centro

### Ejemplo de Colores HSL
```css
/* TalentCloudSolution (default) */
primary_color: "hsl(177, 33%, 52%)"    /* Turquesa */
secondary_color: "hsl(177, 40%, 42%)"  /* Turquesa oscuro */

/* Grupo Arma */
primary_color: "hsl(217, 91%, 60%)"    /* Azul */
secondary_color: "hsl(262, 83%, 58%)"  /* Morado */
```

## Límites y Consumo

### Límites de Licencia
Cada centro tiene límites definidos en su licencia activa:
- **max_students**: Número máximo de alumnos activos
- **max_teachers**: Número máximo de profesores activos
- **max_courses**: Número máximo de cursos activos

### Validación
El sistema valida:
1. Al crear usuario → verifica límite de licencia
2. Al crear curso → verifica límite de licencia
3. Al matricular alumno → verifica límite de licencia

### Facturación por Consumo
TalentCloudSolution puede facturar:
- Licencia base mensual
- Usuarios adicionales
- Cursos adicionales
- Contenido personalizado (pedidos)
- Servicios premium

## Seguridad y Aislamiento

### Row Level Security (RLS)

#### Tabla `training_centers`
- Super_admin: acceso completo
- Admin: solo puede ver/editar su centro

#### Tabla `content_orders`
- Super_admin: ve todos los pedidos
- Admin: solo ve pedidos de su centro

#### Tabla `users` / `profiles`
- Super_admin: ve todos
- Admin: solo ve usuarios de su centro

#### Tabla `courses`
- Super_admin: ve todos
- Admin: solo ve cursos de su centro
- Profesores: solo sus cursos asignados
- Alumnos: solo cursos en los que están matriculados

### Políticas Implementadas
```sql
-- Ejemplo: Pedidos de contenido
CREATE POLICY "super_admin_all_orders"
  ON content_orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "admin_own_center_orders"
  ON content_orders
  FOR SELECT
  TO authenticated
  USING (
    training_center_id IN (
      SELECT training_center_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

## Casos de Uso

### Caso 1: Nuevo Centro - Grupo Arma
1. Super_admin crea "Grupo Arma Formación"
2. Configura logo azul y branding
3. Crea licencia: 200 alumnos, 15 profesores, 30 cursos
4. Crea admin: admin@grupoarma.com
5. Grupo Arma inicia sesión → ve su branding
6. Crea 10 profesores y 150 alumnos
7. Solicita 5 cursos personalizados
8. TalentCloudSolution desarrolla cursos
9. Factura mensual: licencia + cursos

### Caso 2: Renovación de Licencia
1. Licencia de centro expira
2. Super_admin crea nueva licencia
3. Ajusta límites según necesidad actual
4. Genera factura
5. Al pagar, licencia se activa

### Caso 3: Escalado de Centro
1. Centro alcanza límite de alumnos
2. Admin solicita aumentar cupo
3. Super_admin edita licencia activa
4. Aumenta max_students
5. Ajusta precio
6. Genera factura por diferencia

## Monitoreo y Análisis

### Métricas Clave (Super Admin)
- Número de centros activos
- Total de licencias activas/expiradas
- Ingresos mensuales por centro
- Pedidos pendientes/en progreso/completados
- Usuarios totales por rol
- Cursos activos totales

### Métricas por Centro (Admin)
- Alumnos activos vs límite
- Profesores activos vs límite
- Cursos activos vs límite
- Progreso de pedidos
- Tasa de finalización de cursos
- Actividad de alumnos

## Soporte y Comunicación

### Admin de Centro → TalentCloudSolution
- Solicitudes de contenido (sistema de pedidos)
- Soporte técnico (módulo de soporte)
- Solicitud de cambios en licencia

### TalentCloudSolution → Admin de Centro
- Notificaciones de pedidos completados
- Avisos de renovación de licencia
- Updates del sistema
- Facturas y pagos

## Backup y Recuperación

### Responsabilidades TalentCloudSolution
- Backup diario de base de datos
- Backup de logos y archivos (storage)
- Recuperación ante desastres
- Actualizaciones del sistema

### Responsabilidades Admin Centro
- Gestión de contenido de cursos
- Backup de evaluaciones
- Gestión de usuarios

## Roadmap Sugerido

### Fase 1 (Actual) ✅
- Multi-tenancy básico
- Gestión de centros
- Sistema de pedidos
- Branding personalizado

### Fase 2 (Próximo)
- [ ] Notificaciones automáticas de pedidos
- [ ] Dashboard de métricas por centro
- [ ] Facturación automática
- [ ] Renovación automática de licencias

### Fase 3 (Futuro)
- [ ] Portal de autoservicio para centros
- [ ] Catálogo de cursos predefinidos
- [ ] Marketplace de contenido
- [ ] API para integraciones
- [ ] Reportes avanzados
