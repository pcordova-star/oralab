
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del dominio.

### Configuración de Dominio WWW (Cloudflare)
Para que `www.oralab.cl` funcione correctamente junto al dominio raíz:
1. **En Firebase Console**: Ve a App Hosting -> Configuración -> Dominios y agrega `www.oralab.cl`.
2. **En Cloudflare**:
   - Asegúrate de tener el registro `CNAME` con nombre `www` apuntando a `oralab.cl`.
   - Mantén el **Proxy Status** en "DNS Only" (nube gris) hasta que Firebase marque el dominio como "Activo".
   - Verifica que existan los registros `TXT` con el valor `fah-claim` proporcionado por Firebase para ambos registros (`@` y `www`).

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
