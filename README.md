# ORPA Inversiones - Sistema de Autenticación

Este es un proyecto [Next.js](https://nextjs.org) que incluye un sistema completo de autenticación con funcionalidades de registro, login y recuperación de contraseña.

## Características

- ✅ Sistema de autenticación con Supabase
- ✅ Registro de usuarios con validación de cédula
- ✅ Login con cédula y contraseña
- ✅ **Recuperación de contraseña por email (Resend)**
- ✅ Validación de formularios
- ✅ Interfaz responsive con Tailwind CSS
- ✅ Logging estructurado
- ✅ Rate limiting

## Configuración

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y configura las siguientes variables:

```bash
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# URL del sitio (para enlaces en emails)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Configuración de Resend para envío de emails
RESEND_API_KEY=your_resend_api_key_here
```

### 2. Configuración de Resend

1. Crea una cuenta en [Resend](https://resend.com)
2. Obtén tu API Key desde el dashboard
3. Configura la variable `RESEND_API_KEY` en tu archivo `.env.local`
4. Verifica tu dominio en Resend (opcional para producción)

### 3. Instalación

```bash
npm install
# o
yarn install
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Funcionalidades de Recuperación de Contraseña

### Flujo de Recuperación

1. **Solicitud de Reset**: El usuario ingresa su cédula en `/auth/forgot-password`
2. **Envío de Email**: Se envía un email con un enlace de recuperación usando Resend
3. **Validación de Token**: El enlace contiene un token temporal válido por 15 minutos
4. **Nueva Contraseña**: El usuario puede establecer una nueva contraseña

### Endpoints API

- `POST /api/reset-password` - Solicitar reset de contraseña
- `GET /api/reset-password?token=xxx` - Validar token de reset
- `PUT /api/reset-password` - Actualizar contraseña con token

### Páginas

- `/auth/forgot-password` - Formulario para solicitar reset
- `/auth/reset-password?token=xxx` - Formulario para nueva contraseña
- `/test-reset-password` - Página de pruebas para desarrolladores

### Seguridad

- Tokens temporales con expiración de 15 minutos
- Validación de formato de cédula y email
- No se revela si una cédula existe en el sistema
- Limpieza automática de tokens expirados
- Rate limiting en endpoints sensibles

## Páginas de Prueba

- `/test-supabase` - Verificar conexión con Supabase
- `/test-smtp` - Probar configuración de email
- `/test-reset-password` - Probar funcionalidad de reset completa

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
