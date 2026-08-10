
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"** o **"NXDOMAIN"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del certificado SSL.

## Configuración de Correos (Trigger Email Extension)
Para que las confirmaciones de reserva lleguen a los pacientes, la extensión en Firebase Console debe configurarse así:

- **Colección**: `mail`
- **Authentication Type**: `Username & Password`
- **SMTP URI**: `smtps://control%40pcgoperacion.com:jsvfmrifbtqmlzye@smtp.gmail.com:465`
- **From Address**: `contacto@oralab.cl`

### Diagnóstico de Fallas (Si el correo no llega)

1.  **Functions Vacías (CRÍTICO)**: Si en tu menú lateral de Firebase vas a la pestaña **Functions** y está vacía, la extensión **NO está funcionando**. 
    *   **Solución**: Ve a **Extensions**, entra en **Trigger Email** y verifica si hay errores de instalación. Si no ves funciones en la pestaña correspondiente, desinstala la extensión y vuelve a instalarla. Sin funciones listadas, el "disparador" no existe.
2.  **Campo `delivery` en Firestore**:
    *   Si el documento en la colección `mail` **NO tiene** el campo `delivery`, la extensión no está escuchando la base de datos. Verifica que el nombre de la colección configurado en la extensión sea exactamente `mail` (en minúsculas).
    *   Si el campo `delivery` aparece como `ERROR`, haz clic en él para ver el motivo (usualmente es porque Gmail bloqueó el acceso o la "Contraseña de Aplicación" es incorrecta).
3.  **Logs de Cloud Functions**:
    *   Ve a **Functions** > Busca `ext-firestore-send-email-processQueue` > Pestaña **Logs**. Allí aparecerá el error exacto de conexión SMTP.

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
