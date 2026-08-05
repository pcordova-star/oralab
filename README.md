
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"** o **"NXDOMAIN"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del certificado SSL.

### Configuración de Dominio (Cloudflare)
La configuración actual es CORRECTA:
1. **Registros TXT**: Configurados para validación de propiedad (`fah-claim`).
2. **Registro A**: Apuntando a la infraestructura de Google (`35.219.200.4`).
3. **WWW Subdomain**: Configurado como CNAME hacia el raíz.
4. **Proxy Status**: Debe permanecer en **Gris (DNS Only)** hasta que el dominio aparezca como "Active" en Firebase Console.

## Configuración de Correos (Trigger Email Extension)
Para que las confirmaciones de reserva lleguen a los pacientes, la extensión en Firebase Console debe configurarse así:
- **Colección**: `mail`
- **SMTP URI**: `smtps://tu-correo@gmail.com:clave_aplicacion@smtp.gmail.com:465`
- **From Address**: El correo oficial de Oralab (ej. `Oralab <tu-correo@gmail.com>`).

### Cómo obtener la Clave de Aplicación (Gmail)
1. Ve a: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Asegúrate de tener activa la **Verificación en 2 pasos**.
3. Selecciona "App" -> "Otros" y ponle un nombre (ej: "Firebase Oralab").
4. Genera y copia el código de 16 caracteres. **Ese código es la "clave_aplicacion" para el SMTP URI.**

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`
- **Configuración Inicial**: Si es la primera vez que accedes, escribe el email `admin@oralab.cl`, pon una contraseña y usa el botón **"¿Primer acceso? Crear cuenta Admin"**.

## Guía de Desarrollo (Comandos Git)

Ejecuta estos comandos para subir tus cambios y activar un nuevo despliegue en Firebase:

```bash
# 1. Preparar los archivos
git add .

# 2. Confirmar cambios con descripción técnica
git commit -m "Mejora: Documentación de correos y estabilidad del sistema"

# 3. Subir a GitHub (esto activa App Hosting automáticamente)
git push origin main
```

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
