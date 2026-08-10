
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

### ¿Cómo encontrar los Logs de Error?
Si los correos no se envían y el campo `delivery` no aparece en Firestore, debes revisar los logs técnicos:

1.  **Ve al Menú Lateral Izquierdo**: Busca la sección **Build** (Compilación) y haz clic en **Functions**.
2.  **Busca la Función de la Extensión**: En la lista de funciones, busca una llamada `ext-firestore-send-email-processQueue`.
3.  **Abre los Logs**: Haz clic en el nombre de esa función y luego selecciona la pestaña **Logs** en el menú superior.
4.  **Busca errores**: Ahí verás mensajes como "Auth credentials invalid", "Connection timeout" o "SUCCESS".

**Nota importante**: El campo `to` en Firestore debe estar en la raíz del documento (fuera de `message`). El código actual ya maneja esto correctamente.

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
