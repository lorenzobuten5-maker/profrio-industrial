# Setup ProFrio Industrial App

## 1. Configuración de Supabase
1. Crear un proyecto en Supabase.
2. Ejecutar el SQL schema proporcionado.
3. Configurar RLS (Row Level Security):
   - Políticas para empleados (sólo ven y gestionan sus propios formularios).
   - Políticas para jefes (ven y gestionan los formularios de todos).
4. Obtener URL y Anon Key desde Project Settings > API y pegarlas en `js/supabase-config.js`.

## 2. Configuración de EmailJS
1. Crear una cuenta en EmailJS.
2. Crear un servicio de email y anotar el Service ID.
3. Crear plantillas para Intervención y Materiales y anotar los Template IDs.
4. Obtener la Public Key desde Account Settings.
5. Pegarlos en `js/email.js`.

## 3. Instalar Capacitor para iOS
Ejecutar los siguientes comandos en la terminal en la raíz del proyecto:
```bash
npm install
npx cap add ios
npx cap sync
```
Para abrir el proyecto en Xcode y compilarlo:
```bash
npx cap open ios
```

## 4. SQL Completo
Ejecuta el siguiente código en el SQL Editor de Supabase:

```sql
-- profiles (extiende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('empleado', 'jefe')),
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'bloqueado', 'baneado')),
  baneado_hasta TIMESTAMPTZ,
  fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- presencia (online status)
CREATE TABLE presencia (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  online BOOLEAN DEFAULT FALSE,
  ultima_conexion TIMESTAMPTZ,
  ultima_desconexion TIMESTAMPTZ
);

-- formularios_intervencion
CREATE TABLE formularios_intervencion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  numero INTEGER NOT NULL,
  nombre TEXT, jornada TEXT,
  num_desplazamiento TEXT, num_intervinientes TEXT,
  tipo_servicio TEXT,
  cliente TEXT, direccion TEXT, telefono TEXT,
  chk_tecnico BOOLEAN DEFAULT FALSE,
  chk_jefe_obra BOOLEAN DEFAULT FALSE,
  chk_jefe_equipo BOOLEAN DEFAULT FALSE,
  horas_tecnico TEXT, horas_jefe_obra TEXT, horas_jefe_equipo TEXT,
  chk_aires BOOLEAN DEFAULT FALSE,
  chk_rack BOOLEAN DEFAULT FALSE,
  inp_nivel_liquido TEXT, inp_nivel_aceite TEXT,
  chk_correccion_fuga BOOLEAN DEFAULT FALSE,
  chk_carga_refrigerante BOOLEAN DEFAULT FALSE,
  chk_cambio_compresor BOOLEAN DEFAULT FALSE,
  chk_mant_aa BOOLEAN DEFAULT FALSE,
  chk_mant_nevera BOOLEAN DEFAULT FALSE,
  chk_cambio_solenoide BOOLEAN DEFAULT FALSE,
  chk_cambio_abanico BOOLEAN DEFAULT FALSE,
  temp_congelado TEXT, temp_deli_queso TEXT, temp_deli_carne TEXT,
  temp_salami TEXT, temp_yogurt TEXT, temp_vegetales TEXT, temp_jugos TEXT,
  cf_vegetales TEXT, cf_congelado TEXT, cf_carnes TEXT,
  cf_pescados TEXT, cf_preparacion TEXT,
  observaciones TEXT, pedido_materiales TEXT,
  firma_interviniente TEXT, firma_cliente TEXT,
  fotos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, numero)
);

-- formularios_materiales
CREATE TABLE formularios_materiales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  numero INTEGER NOT NULL,
  fecha_dia INTEGER, fecha_mes INTEGER, fecha_anio INTEGER,
  cliente TEXT, direccion TEXT, telefono TEXT,
  items JSONB DEFAULT '[]',
  total NUMERIC(10,2) DEFAULT 0,
  despachado_por TEXT, recibido_conforme TEXT,
  observaciones TEXT,
  fotos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, numero)
);
```

## 5. Código secreto de admin
Para registrar a los jefes, se necesita ingresar un código secreto en el formulario de registro:
`PROFRIO_ADMIN_2024`

## 6. Cómo crear las cuentas de jefe
1. Ve a la pantalla principal e ingresa al registro de usuarios.
2. Selecciona el rol de "Jefe".
3. Ingresa el código secreto proporcionado.
4. Completa el resto del formulario para crear la cuenta.
