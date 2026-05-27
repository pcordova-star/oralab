
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Guía de Configuración DNS (Cloudflare)

Para que el dominio `oralab.cl` funcione con Firebase App Hosting, sigue esta configuración exacta en Cloudflare:

### 1. Registro A (Dominio Principal)
- **Tipo**: `A`
- **Nombre**: `@`
- **Contenido**: `35.219.200.4` (Verifica la IP en tu consola de Firebase)
- **Proxy Status**: **DNS ONLY (Nube Gris)** <- CRÍTICO

### 2. Registro CNAME (www)
- **Tipo**: `CNAME`
- **Nombre**: `www`
- **Contenido**: `oralab.cl`
- **Proxy Status**: **DNS ONLY (Nube Gris)**

### 3. Registro CNAME de Validación (SSL)
Este es el registro que aparece en tu captura de pantalla:
- **Tipo**: `CNAME`
- **Nombre**: `_acme-challenge_3vy6hxc24yw4ws5e` (Sin el dominio al final y sin el punto final)
- **Contenido**: `6c9ac2ff-9ac6-40b5-b1a7-dd727fce4cfb.7.authorize.certificatemanager.goog.` (Aquí sí puedes dejar el punto final)
- **Proxy Status**: **DNS ONLY (Nube Gris)** <- OBLIGATORIO

**IMPORTANTE**: Una vez que en la consola de Firebase el estado del dominio cambie a **"Active"**, puedes volver a Cloudflare y activar las nubes naranjas (Proxied) para mayor seguridad.

## Despliegue en Firebase App Hosting

1. Conecta este repositorio en la consola de Firebase.
2. En el paso de variables de entorno, agrega:
   - `GOOGLE_GENAI_API_KEY`: Tu llave de Google AI Studio.
3. El despliegue automático se activará con cada `git push origin main`.

---
© 2024 Oralab Clinical Lab.
