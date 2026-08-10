
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

1.  **Plan Blaze (REQUERIDO)**: Si en tu menú lateral de Firebase NO aparece la pestaña **Functions** o está vacía, es muy probable que el proyecto esté en el plan gratuito (Spark). Las extensiones requieren el plan **Blaze** (pago por uso) para poder desplegar las funciones que envían correos.
2.  **Estado de la Extensión**: Ve a **Extensions** y verifica que no diga "Installing..." o "Failed". Si falló, suele ser por falta del plan Blaze.
3.  **Campo `delivery` en Firestore**:
    *   Si ves el documento en la colección `mail` pero **NO existe** el campo `delivery`, la extensión no está escuchando la base de datos. Verifica que el nombre de la colección configurado sea exactamente `mail`.
    *   Si el campo `delivery` aparece como `ERROR`, haz clic en él para ver el motivo (usualmente contraseña de aplicación de Gmail incorrecta).

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
