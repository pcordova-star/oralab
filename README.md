
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

### Solución de Errores: "No aparece el campo delivery"
Si los documentos se crean en Firestore pero no tienen el campo `delivery`, la extensión no se está ejecutando.

1.  **Ver logs en la Terminal**:
    ```bash
    firebase functions:log --only ext-firestore-send-email-processQueue
    ```
    *(Nota: El nombre de la función puede variar, verifícalo con `firebase functions:list`)*.

2.  **Ver logs en la Consola**:
    Ve a Firebase Console -> Extensions -> Trigger Email -> Pestaña **Logs**.
    Busca errores de **"Auth credentials invalid"** (indica que la clave de aplicación de Gmail falló) o **"Permission Denied"**.

3.  **Verificación de Seguridad**:
    Asegúrate de que en la configuración de la extensión, el campo **"SMTP connection URI"** sea el único configurado para la conexión. No dupliques la contraseña en el campo "SMTP password".

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
