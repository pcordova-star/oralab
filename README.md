
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

### ¿Dónde ver los Logs de Error?
Si los correos no salen y no aparece el campo `delivery` en Firestore:

1.  **En la Consola de Firebase**:
    - Ve al menú lateral izquierdo -> **Build** -> **Functions**.
    - Busca la función: `ext-firestore-send-email-processQueue`.
    - Haz clic en la pestaña **Logs**.
    - Busca errores como "Auth credentials invalid" o "Connection timeout".

2.  **Verificación de Seguridad**:
    Asegúrate de que en la configuración de la extensión, el campo **"SMTP connection URI"** sea el único configurado para la conexión. No dupliques la contraseña en el campo "SMTP password".

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
