
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Guía de Configuración DNS (Cloudflare)

Para que el dominio `oralab.cl` funcione con Firebase App Hosting, sigue esta configuración exacta en Cloudflare:

1. **A Record (@)**:
   - Name: `@`
   - Content: `35.219.200.4` (o la IP que te dé Firebase)
   - Proxy Status: **DNS ONLY (Nube Gris)** <- CRÍTICO

2. **CNAME Record (www)**:
   - Name: `www`
   - Content: `@`
   - Proxy Status: **DNS ONLY (Nube Gris)**

3. **TXT Record (fah-claim)**:
   - Este es para validar la propiedad del dominio.
   - Proxy Status: **DNS ONLY**

4. **CNAME Record (_acme-challenge)**:
   - Usado para el certificado SSL.
   - Proxy Status: **DNS ONLY (Nube Gris)**

**IMPORTANTE**: Una vez que en la consola de Firebase el estado del dominio cambie a **"Active"**, puedes volver a Cloudflare y activar las nubes naranjas (Proxied) para mayor seguridad.

## Despliegue en Firebase App Hosting

1. Conecta este repositorio en la consola de Firebase.
2. En el paso de variables de entorno, agrega:
   - `GOOGLE_GENAI_API_KEY`: Tu llave de Google AI Studio.
3. El despliegue automático se activará con cada `git push origin main`.

---
© 2024 Oralab Clinical Lab.
