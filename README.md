
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"** o **"NXDOMAIN"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del certificado SSL.

### Configuración de Dominio (Cloudflare)
La configuración actual es CORRECTA:
1. **Registros TXT**: Configurados para validación de propiedad (`fah-claim`).
2. **Registro A**: Apuntando a la infraestructura de Google (`35.219.200.4`).
3. **WWW Subdomain**: Configurado como CNAME hacia el raíz.
4. **Proxy Status**: Debe permanecer en **Gris (DNS Only)** hasta que el dominio aparezca como "Activo" en Firebase Console.

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`
- **Configuración Inicial**: Si es la primera vez que accedes, escribe el email `admin@oralab.cl`, pon una contraseña y usa el botón **"¿Primer acceso? Crear cuenta Admin"**.

## Guía de Desarrollo (Comandos Git)

Para subir cambios y activar un nuevo despliegue (Rollout) en Firebase:

```bash
# 1. Preparar los archivos
git add .

# 2. Confirmar cambios con descripción técnica
git commit -m "Actualización: Logo único, narrativa clínica y corrección de hidratación"

# 3. Subir a GitHub (esto activa App Hosting)
git push origin main
```

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
