
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del dominio.

### Solución al error NXDOMAIN en www.oralab.cl
Si `oralab.cl` funciona pero `www.oralab.cl` da error de "sitio no encontrado", verifica lo siguiente en **Cloudflare**:

1. **Registro CNAME**: Asegúrate de tener un registro tipo `CNAME` con nombre `www` y contenido `@` (o `oralab.cl`).
2. **Proxy Status**: Para la validación inicial de Firebase, asegúrate de que la nube esté en **Gris (DNS Only)**. Firebase necesita ver tu servidor DNS directamente para validar el certificado SSL.
3. **Validación en Firebase**: En Firebase Console -> App Hosting -> Configuración -> Dominios, el dominio `www.oralab.cl` debe aparecer como **"Activo"**. Si no lo has agregado allí, Firebase no sabrá cómo recibir el tráfico de `www`.

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`
- **Configuración Inicial**: Si es la primera vez que accedes, escribe el email `admin@oralab.cl`, una contraseña y usa el botón **"¿Primer acceso? Crear cuenta Admin"**.

## Guía de Desarrollo (Comandos Git)

Para subir cambios y activar un nuevo despliegue:

```bash
git add .
git commit -m "Descripción de tus mejoras"
git push origin main
```

---
© 2024 Oralab Clinical Lab.
