# Configuración Usuario Admin - Grupo Arma Formación

## Credenciales de Prueba

- **Email:** admin@grupoarma.com
- **Contraseña:** GrupoArma2024!
- **Nombre:** Admin Grupo Arma

## Pasos de Configuración

### 1. Crear el usuario
Ve a `/auth` y registra el usuario con las credenciales de arriba.

### 2. Asignar centro y rol de admin
Una vez creado el usuario, ejecuta esta query en la base de datos:

```sql
-- Obtener el ID del usuario y del centro
DO $$
DECLARE
  v_user_id uuid;
  v_center_id uuid;
BEGIN
  -- Obtener el ID del usuario por email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'admin@grupoarma.com';
  
  -- Obtener el ID del centro Grupo Arma
  SELECT id INTO v_center_id 
  FROM public.training_centers 
  WHERE name = 'Grupo Arma Formación' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_center_id IS NOT NULL THEN
    -- Actualizar perfil con el centro
    UPDATE public.profiles 
    SET training_center_id = v_center_id
    WHERE id = v_user_id;
    
    -- Asignar rol de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Usuario configurado correctamente';
  ELSE
    RAISE NOTICE 'Usuario o centro no encontrado';
  END IF;
END $$;
```

### 3. Verificar
Cierra sesión y vuelve a iniciar sesión con las credenciales. Deberías ver:
- Logo de Grupo Arma en el header
- Colores azules de Grupo Arma en toda la plataforma
- Acceso al dashboard de admin en `/dashboard/admin`

## Notas

- El branding se aplica automáticamente al usuario según su centro asignado
- Los colores se cargan dinámicamente desde la configuración del centro
- El admin puede personalizar el logo y colores desde `/dashboard/admin/center-settings`
