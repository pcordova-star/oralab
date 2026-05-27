
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue.

### Pasos para Activar el Sitio:
1. **Push al repositorio**: Ejecuta los comandos de Git de abajo.
2. **Revisar Rollouts**: Entra a [Firebase Console](https://console.firebase.google.com/) -> App Hosting -> Tu Backend -> **Rollouts**.
3. **Validación de Dominio**: En la pestaña **Settings -> Domains**, el estado debe decir **Active**.

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`
- **Configuración Inicial**: Si es la primera vez que accedes, escribe el email `admin@oralab.cl`, una contraseña (mínimo 6 caracteres) y haz clic en el botón inferior **"¿Primer acceso? Crear cuenta Admin"**.
- **Funcionalidad**: Gestión de citas, cambios de estado (Llegó, Iniciado, Completado) y eliminación de registros.

## Guía de Desarrollo (Comandos Git)

Para subir las últimas mejoras, ejecuta:

```bash
git add .
git commit -m "Admin Setup: Habilitada creación de cuenta administrativa inicial y corrección de flujos"
git push origin main
```

## Características Técnicas
- **Home de Alta Fidelidad**: Animaciones Framer Motion (Tech Scanner).
- **Informe Interactivo**: Gráfico multigas (H2, CH4, H2S) para interpretación médica.
- **Robustez Administrativa**: Ordenamiento en memoria y validación de rol estricta.

---
© 2024 Oralab Clinical Lab.
