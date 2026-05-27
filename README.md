
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"** o **"NXDOMAIN"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue o la validación del certificado SSL.

### Configuración de Dominio (Cloudflare)
La configuración actual es CORRECTA:
1. **Registros TXT**: Configurados para validación de propiedad (`fah-claim`).
2. **Registro A**: Apuntando a la infraestructura de Google.
3. **WWW Subdomain**: Configurado como CNAME hacia el raíz.
4. **Proxy Status**: Debe permanecer en **Gris (DNS Only)** hasta que el dominio aparezca como "Activo" en Firebase Console.

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`
- **Configuración Inicial**: Si es la primera vez que accedes, escribe el email `admin@oralab.cl`, una contraseña y usa el botón **"¿Primer acceso? Crear cuenta Admin"**.

## Guía de Desarrollo (Comandos Git)

Para subir cambios y activar un nuevo despliegue (Rollout):

```bash
git add .
git commit -m "Descripción de tus mejoras"
git push origin main
```

---
© 2024 Oralab Clinical Lab. Tecnologia Sunvou®.
