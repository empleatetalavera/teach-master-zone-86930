# Configuración Super Administrador - TalentCloudSolution

## Arquitectura Multi-Tenant

La plataforma funciona como un sistema **multi-tenant SaaS**:

- **TalentCloudSolution**: Proveedor de la plataforma (super_admin)
- **Centros de Formación**: Clientes que usan la plataforma (admin)

## Roles del Sistema

### super_admin (Super Administrador)
- Administradores de TalentCloudSolution
- Gestión de **todos los centros de formación**
- Gestión de **licencias**
- Facturación global
- Pedidos de contenido de todos los centros
- Visibilidad completa del sistema

### admin (Administrador de Centro)
- Administradores de cada centro de formación individual
- Gestión de su centro (branding, configuración)
- Gestión de usuarios de su centro
- Gestión de cursos de su centro
- Solicitar contenido (pedidos que van al super_admin)
- Vista limitada a su centro

## Crear Super Administrador

### Opción 1: Desde el código (Recomendado para el primer super_admin)

1. Ejecuta la siguiente consulta SQL en la base de datos:

```sql
-- Primero, crea el usuario en auth.users (si no existe)
-- Esto requiere usar la función create-test-user o registrarse manualmente

-- Luego, asigna el rol super_admin
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@talentcloudsolution.com'),
  'super_admin'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;
```

### Opción 2: Usar la función edge function

```bash
curl -X POST 'https://fkxbgifvwivlvpwxdzdb.supabase.co/functions/v1/create-test-user' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@talentcloudsolution.com",
    "password": "TuPasswordSegura123!",
    "fullName": "Admin TalentCloud",
    "role": "super_admin"
  }'
```

## Diferencias en el Panel de Control

### Panel Super Admin
- ✅ Dashboard
- ✅ Centros de Formación
- ✅ Licencias
- ✅ Facturación Global
- ✅ Pedidos de Contenido (de todos los centros)
- ✅ Análisis AI
- ✅ Todos los Usuarios
- ✅ Soporte Global

### Panel Admin de Centro
- ✅ Dashboard
- ✅ Mi Centro (personalización de branding)
- ✅ Trazabilidad SEPE
- ✅ Usuarios (solo de su centro)
- ✅ Cursos (solo de su centro)
- ✅ Configurar Cursos
- ✅ Solicitar Contenido (pedidos que van al super_admin)
- ✅ Informes
- ✅ Atención al Alumno

## Branding Personalizado

Cada centro de formación puede personalizar:
- Logo (aparece en el login)
- Colores primarios y secundarios
- Insignia oficial (ej: "Centro Acreditado SEPE")
- Texto del footer

Los admin de centro pueden modificar esto desde **Mi Centro** en su panel.

## Flujo de Trabajo

1. **Super Admin** crea centros de formación y asigna licencias
2. **Super Admin** crea usuarios admin para cada centro
3. **Admin de Centro** personaliza su branding
4. **Admin de Centro** crea usuarios (profesores, alumnos)
5. **Admin de Centro** solicita cursos/contenido
6. **Super Admin** recibe y gestiona pedidos
7. **Super Admin** factura según consumo

## Credenciales de Prueba

### Grupo Arma Formación (Centro de ejemplo)
- Email: `admin@grupoarma.com`
- Password: `GrupoArma2024!`
- Rol: `admin` (administrador de centro)

### TalentCloudSolution (Super Admin - por crear)
- Email: `admin@talentcloudsolution.com`
- Password: `[TU_PASSWORD]`
- Rol: `super_admin`
