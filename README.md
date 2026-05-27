
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Configuración DNS (Verificado)

La configuración en Cloudflare es **CORRECTA**. El sitio está listo para la validación de Firebase.

### Registros DNS Configurados:
1. **Registro A**: `oralab.cl` -> `35.219.200.4` (**DNS Only / Nube Gris**)
2. **CNAME _acme-challenge**: Para validación SSL de Google (**DNS Only / Nube Gris**)
3. **CNAME www**: Redirección a dominio principal (**DNS Only / Nube Gris**)
4. **TXT fah-claim**: Validación de propiedad para App Hosting (**DNS Only**)

### Herramientas de Verificación:
- [DNS Checker - Registro A](https://dnschecker.org/#A/oralab.cl)
- [What My DNS](https://www.whatsmydns.net/#A/oralab.cl)
- [Google Dig](https://toolbox.googleapps.com/apps/dig/#A/oralab.cl)

**IMPORTANTE**: No activar la nube naranja (Proxy) hasta que el panel de Firebase indique que el dominio está en estado **"Active"**.

## Despliegue en Firebase App Hosting

1. Repositorio: `https://github.com/pcordova-star/oralab`
2. Variables de Entorno Críticas:
   - `GOOGLE_GENAI_API_KEY`: Necesaria para la generación de instrucciones con IA.

---
© 2024 Oralab Clinical Lab.
