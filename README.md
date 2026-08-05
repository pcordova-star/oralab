
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"** o **"NXDOMAIN"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del certificado SSL.

## Configuración de Correos (Trigger Email Extension)
Para que las confirmaciones de reserva lleguen a los pacientes, la extensión en Firebase Console debe configurarse así:

- **Colección**: `mail`
- **Authentication Type**: `Username & Password`
- **SMTP URI**: Ver sección de "Solución de Errores" abajo.
- **From Address**: `pcordova@oralab.cl`

### Solución de Errores de Instalación (SMTP URI)
Si la extensión te da "Error de instalación", es casi seguro que el **SMTP connection URI** tiene un error de formato. 

**IMPORTANTE**: 
1. La contraseña de aplicación **NO** debe tener espacios.
2. El correo del usuario debe cambiar el `@` por `%40`.

**Copia y pega este URI exacto (reemplazando los datos si cambian):**
`smtps://control%40pcgoperacion.com:jsvfmrifbtqmlzye@smtp.gmail.com:465`

### Cómo obtener la Clave de Aplicación (Gmail)
1. Ve a: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Asegúrate de tener activa la **Verificación en 2 pasos**.
3. Selecciona "App" -> "Otros" y ponle un nombre (ej: "Firebase Oralab").
4. Genera y copia el código de 16 caracteres. **Úsalo sin espacios en el URI.**

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
