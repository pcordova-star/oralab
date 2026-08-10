
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"** o **"NXDOMAIN"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del certificado SSL.

## Configuración de Correos (Trigger Email Extension)
Para que las confirmaciones de reserva lleguen a los pacientes, la extensión en Firebase Console debe configurarse así:

- **Colección**: `mail`
- **Authentication Type**: `Username & Password`
- **SMTP URI**: Ver sección de "Solución de Errores" abajo.
- **From Address**: `contacto@oralab.cl`

### IMPORTANTE: Estructura de Documento
Para que la extensión funcione, los documentos en la colección `mail` deben tener:
1.  Un campo `to` **en la raíz** (puede ser un string o un array de strings).
2.  Un objeto `message` **en la raíz** con los campos `subject`, `text` y `html`.

**Si el campo `to` se guarda dentro de `message`, el correo NUNCA saldrá.**

### Solución de Errores: "No aparece el campo delivery"
Si ves los documentos en Firestore pero no tienen el campo `delivery` (ni success ni error), el disparador de la extensión no está funcionando.

1.  **Revisa los Logs**: Ve a Firebase Console -> Extensions -> Trigger Email -> **Logs**. 
2.  Busca errores de **"Function failed to deploy"** o **"Permission Denied"**.
3.  **Re-instala**: Si no hay logs, desinstala la extensión y vuelve a instalarla asegurándote de usar este URI exacto:
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
